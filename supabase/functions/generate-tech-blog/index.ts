import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const MEDIASTACK_API_KEY = Deno.env.get("MEDIASTACK_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");
    if (!MEDIASTACK_API_KEY) throw new Error("MEDIASTACK_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Fetch latest tech news from Mediastack
    const newsUrl = `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_API_KEY}&categories=technology&languages=en&sort=published_desc&limit=5`;
    const newsRes = await fetch(newsUrl);
    if (!newsRes.ok) {
      const errText = await newsRes.text();
      throw new Error(`Mediastack error [${newsRes.status}]: ${errText}`);
    }
    const newsData = await newsRes.json();
    const articles = newsData?.data;
    if (!articles || articles.length === 0) {
      throw new Error("No tech news found from Mediastack");
    }

    // Pick first article with a title
    const article = articles.find((a: any) => a.title) || articles[0];
    const headline = article.title;
    const description = article.description || "";
    const newsSource = article.source || "Unknown";

    // Step 2: Generate blog post using Gemini API
    const geminiPrompt = `You are an expert tech blogger. Based on this news: "${headline}. ${description}", write a detailed blog post of 600 words. Cover what happened, why it matters, and future impact. Return ONLY a valid JSON object with keys: title (string), content (string - use markdown formatting), category (one of: AI, Software, Gadgets, Startups, Web3), image_url (use a relevant free Unsplash image URL like https://images.unsplash.com/photo-... )`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: geminiPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
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

    // Parse JSON from response (strip markdown code fences if present)
    const jsonStr = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let blogData: { title: string; content: string; category: string; image_url: string };
    try {
      blogData = JSON.parse(jsonStr);
    } catch {
      throw new Error(`Failed to parse Gemini response as JSON: ${jsonStr.substring(0, 200)}`);
    }

    // Validate category
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
        source: newsSource,
      })
      .select()
      .single();

    if (insertError) throw new Error(`Supabase insert error: ${insertError.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        blog: {
          id: insertedBlog.id,
          title: insertedBlog.title,
          category: insertedBlog.category,
        },
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
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
