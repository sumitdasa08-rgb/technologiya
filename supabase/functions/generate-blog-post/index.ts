import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = ["Smartphones", "Firmware", "AI", "Gadgets", "Tech News"] as const;
type Category = typeof CATEGORIES[number];

const TOPIC_PROMPTS: Record<Category, string[]> = {
  Smartphones: [
    "OnePlus latest OxygenOS update features",
    "Samsung Galaxy One UI 7 new features",
    "iPhone iOS 19 beta updates and changes",
    "Pixel feature drop latest additions",
    "Xiaomi HyperOS new update breakdown",
    "Realme UI 6 features and improvements",
    "Vivo Funtouch OS latest release",
    "OPPO ColorOS update highlights",
    "Nothing OS 3 new features revealed",
    "Motorola Android updates timeline",
  ],
  Firmware: [
    "iOS 19 beta hands-on review",
    "Android 16 Developer Preview features",
    "One UI 7 beta update changelog",
    "OxygenOS 15 stable rollout news",
    "MIUI to HyperOS migration guide",
    "ColorOS 15 firmware update details",
    "Google Pixel firmware security patch",
    "Samsung Galaxy firmware download guide",
    "iPhone firmware downgrade tutorial",
    "Android security patch importance explained",
  ],
  AI: [
    "Google Gemini latest features on smartphones",
    "Apple Intelligence iOS updates",
    "Samsung Galaxy AI new capabilities",
    "ChatGPT mobile app updates",
    "AI-powered camera features comparison",
    "Voice assistants getting smarter",
    "On-device AI processing explained",
    "AI photo editing tools ranked",
  ],
  Gadgets: [
    "Best budget smartphones under 15000",
    "Flagship killer phones to buy now",
    "Best TWS earbuds in India 2026",
    "Smartwatch vs fitness band comparison",
    "Best power banks for travel",
    "Affordable gaming phones ranked",
    "Best camera phones under 30000",
    "Tablet buying guide for students",
  ],
  "Tech News": [
    "OnePlus 14 launch date and specs leak",
    "Samsung Galaxy S26 rumors roundup",
    "iPhone 17 Pro expected features",
    "Pixel 10 upcoming release news",
    "Xiaomi 16 series announcement",
    "Realme GT 7 Pro India launch",
    "Nothing Phone 3 latest leaks",
    "OPPO Find X8 specs revealed",
    "Vivo X200 series India pricing",
    "Motorola Edge 60 launch details",
  ],
};

const EMOJIS: Record<Category, string[]> = {
  Smartphones: ["📱", "🔥", "💫", "⚡", "✨"],
  Firmware: ["🔄", "📲", "🛠️", "⬆️", "🆕"],
  AI: ["🤖", "🧠", "✨", "💡", "🚀"],
  Gadgets: ["📱", "💻", "⌚", "🎧", "📷"],
  "Tech News": ["📰", "🗞️", "🔔", "💥", "🎯"],
};

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60);
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are not configured");
    }

    // Parse request body for optional category
    let requestedCategory: Category | undefined;
    try {
      const body = await req.json();
      if (body.category && CATEGORIES.includes(body.category)) {
        requestedCategory = body.category as Category;
      }
    } catch {
      // No body or invalid JSON, use random category
    }

    const category = requestedCategory || getRandomItem([...CATEGORIES]);
    const topic = getRandomItem(TOPIC_PROMPTS[category]);
    const emoji = getRandomItem(EMOJIS[category]);

    console.log(`Generating blog post for category: ${category}, topic: ${topic}`);

    // Generate content using Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a tech journalist and blogger writing for Gen Z audience in India. Your writing style:
- Short paragraphs (2-3 sentences max)
- Use emojis to make it engaging and fun
- Casual but informative tone like a tech-savvy friend
- Include practical tips, hot takes, and "should you update?" recommendations
- Be relatable - mention Indian pricing, availability, and relevance
- Use simple language, avoid heavy jargon
- Add relevant hashtags at the end
- Make it feel like breaking news or insider info
- Include specific version numbers, dates, and device names when relevant

You must respond with valid JSON only, no markdown code blocks. The response must be a JSON object with these exact keys:
- title: Catchy headline (max 60 chars, include device/brand name)
- excerpt: Brief summary for card preview (max 150 chars, hook the reader)
- content: Full article in markdown (600-900 words, include subheadings)
- tags: Array of 4-6 relevant tags (without #, include brand names)`,
          },
          {
            role: "user",
            content: `Write a fresh, breaking-news style tech blog post about: "${topic}" in the ${category} category. 
            
Make it relevant for Indian Gen Z tech enthusiasts. Include:
- Specific details (version numbers, features, pricing in INR if applicable)
- "Should you update/buy?" recommendation
- Comparison with competitors if relevant
- When to expect in India (if it's a global news)

Current date context: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
          },
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("No content received from AI");
    }

    console.log("Raw AI response:", rawContent.substring(0, 200));

    // Parse the AI response
    let parsedContent;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = rawContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse AI response as JSON");
    }

    const { title, excerpt, content, tags } = parsedContent;

    if (!title || !excerpt || !content) {
      throw new Error("AI response missing required fields");
    }

    // Create slug from title with timestamp for uniqueness
    const timestamp = Date.now().toString(36);
    const slug = `${createSlug(title)}-${timestamp}`;

    // Insert into database using service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: post, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        title,
        slug,
        content,
        excerpt,
        category,
        tags: tags || [],
        emoji,
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Failed to save post: ${insertError.message}`);
    }

    console.log("Blog post created successfully:", post.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          category: post.category,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating blog post:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
