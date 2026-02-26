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
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const MEDIASTACK_API_KEY = Deno.env.get("MEDIASTACK_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");
    if (!SUPABASE_URL) throw new Error("SUPABASE_URL is not defined");

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert tech blogger. Always respond with only valid JSON, no markdown, no backticks, no extra text whatsoever.",
          },
          {
            role: "user",
            content: `Based on this tech news: Title: "${news.headline}" Description: "${news.description}" — Write a detailed 400-word blog post and return ONLY a raw JSON object with these exact keys: "title" (string), "content" (full blog in plain paragraphs, no markdown), "category" (must be one of: AI, Software, Gadgets, Startups, Web3), "image_url" (use this exact URL: https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800)`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      throw new Error(`Groq API error: ${groqResponse.status} — ${errText}`);
    }

    const groqData = await groqResponse.json();

    let blogText = groqData.choices?.[0]?.message?.content?.trim?.() ?? "";
    blogText = blogText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let blog: { title: string; content: string; category: string; image_url?: string };
    try {
      blog = JSON.parse(blogText);
    } catch {
      throw new Error(`JSON parse failed. Raw response was: ${blogText.substring(0, 300)}`);
    }

    if (!blog.title || !blog.content || !blog.category) {
      throw new Error(`Groq response missing required fields. Got keys: ${Object.keys(blog || {}).join(", ")}`);
    }

    const validCategories = ["AI", "Software", "Gadgets", "Startups", "Web3"];
    if (!validCategories.includes(blog.category)) {
      blog.category = "Software";
    }

    const { data: insertedBlog, error: insertError } = await supabaseClient
      .from("blogs")
      .insert([{
        title: blog.title,
        content: blog.content,
        category: blog.category,
        image_url: blog.image_url || null,
        source: news.source || "TechCrunch",
        published_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        blog: {
          id: insertedBlog.id,
          title: insertedBlog.title,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "Unknown error",
        stack: error?.stack || null,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
