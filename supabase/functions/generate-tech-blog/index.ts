import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchNewsFromRSS(): Promise<{ headline: string; description: string; source: string }> {
  const feeds = [
    { url: "https://feeds.feedburner.com/TechCrunch", source: "TechCrunch" },
    { url: "https://rss.cnn.com/rss/edition_technology.rss", source: "CNN Tech" },
  ];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url);
      if (!res.ok) continue;
      const xml = await res.text();

      // Extract first <item> title and description
      const itemMatch = xml.match(/<item[^>]*>([\s\S]*?)<\/item>/);
      if (!itemMatch) continue;

      const titleMatch = itemMatch[1].match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      const descMatch = itemMatch[1].match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);

      const headline = titleMatch?.[1]?.replace(/<[^>]*>/g, "").trim();
      if (!headline) continue;

      const description = descMatch?.[1]?.replace(/<[^>]*>/g, "").trim() || "";

      return { headline, description, source: feed.source };
    } catch {
      continue;
    }
  }

  throw new Error("Failed to fetch news from all RSS feeds");
}

async function fetchNewsFromMediastack(apiKey: string): Promise<{ headline: string; description: string; source: string }> {
  const url = `http://api.mediastack.com/v1/news?access_key=${apiKey}&categories=technology&languages=en&sort=published_desc&limit=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Mediastack error [${res.status}]`);

  const data = await res.json();
  const article = data?.data?.find((a: any) => a.title) || data?.data?.[0];
  if (!article?.title) throw new Error("No articles from Mediastack");

  return {
    headline: article.title,
    description: article.description || "",
    source: article.source || "Unknown",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const MEDIASTACK_API_KEY = Deno.env.get("MEDIASTACK_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Fetch news — try Mediastack first, fallback to RSS
    let news: { headline: string; description: string; source: string };
    try {
      if (MEDIASTACK_API_KEY) {
        news = await fetchNewsFromMediastack(MEDIASTACK_API_KEY);
      } else {
        news = await fetchNewsFromRSS();
      }
    } catch (e) {
      console.warn("Mediastack failed, falling back to RSS:", e);
      news = await fetchNewsFromRSS();
    }

    // Step 2: Generate blog with Gemini
    const geminiPrompt = `You are an expert tech blogger. Based on this news: "${news.headline}. ${news.description}", write a detailed blog post of 600 words. Cover what happened, why it matters, and future impact. Return ONLY a valid JSON object with keys: title (string), content (string - use markdown formatting), category (one of: AI, Software, Gadgets, Startups, Web3), image_url (use a relevant free Unsplash image URL like https://images.unsplash.com/photo-... )`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: geminiPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error [${geminiRes.status}]: ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("No content from Gemini API");

    const jsonStr = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let blogData: { title: string; content: string; category: string; image_url: string };
    try {
      blogData = JSON.parse(jsonStr);
    } catch {
      throw new Error(`Failed to parse Gemini JSON: ${jsonStr.substring(0, 200)}`);
    }

    const validCategories = ["AI", "Software", "Gadgets", "Startups", "Web3"];
    if (!validCategories.includes(blogData.category)) {
      blogData.category = "Software";
    }

    // Step 3: Save to Supabase
    const { data: insertedBlog, error: insertError } = await supabase
      .from("blogs")
      .insert({
        title: blogData.title,
        content: blogData.content,
        category: blogData.category,
        image_url: blogData.image_url || null,
        source: news.source,
      })
      .select()
      .single();

    if (insertError) throw new Error(`Supabase insert error: ${insertError.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        blog: { id: insertedBlog.id, title: insertedBlog.title, category: insertedBlog.category },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-tech-blog error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
