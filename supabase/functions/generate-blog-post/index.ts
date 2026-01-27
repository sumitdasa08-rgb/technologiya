import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = ["AI", "Gadgets", "Coding", "Gaming", "Cybersecurity"] as const;
type Category = typeof CATEGORIES[number];

const TOPIC_PROMPTS: Record<Category, string[]> = {
  AI: [
    "Latest ChatGPT and AI assistant updates",
    "AI image generators and creative tools",
    "Machine learning for beginners",
    "AI in everyday life and smartphones",
    "Future of AI and what to expect",
  ],
  Gadgets: [
    "Best budget smartphones in 2025",
    "Laptop buying guide for students",
    "Smart home devices worth buying",
    "Wearable tech and fitness trackers",
    "Gaming accessories and peripherals",
  ],
  Coding: [
    "JavaScript tips and tricks for beginners",
    "Python projects to build today",
    "Web development trends in 2025",
    "Mobile app development basics",
    "Learning to code: where to start",
  ],
  Gaming: [
    "Best budget gaming GPUs",
    "Mobile gaming vs PC gaming",
    "Cloud gaming services compared",
    "Upcoming game releases to watch",
    "Gaming setup tips for beginners",
  ],
  Cybersecurity: [
    "Password managers: which to use",
    "VPN guide for beginners",
    "Protecting yourself from phishing",
    "Two-factor authentication explained",
    "Privacy tips for social media",
  ],
};

const EMOJIS: Record<Category, string[]> = {
  AI: ["🤖", "🧠", "✨", "💡", "🚀"],
  Gadgets: ["📱", "💻", "⌚", "🎧", "📷"],
  Coding: ["👨‍💻", "🔧", "⚡", "💻", "🛠️"],
  Gaming: ["🎮", "🕹️", "🎯", "🏆", "⚔️"],
  Cybersecurity: ["🔐", "🛡️", "🔒", "👁️", "🔑"],
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
            content: `You are a tech blogger writing for Gen Z audience. Your writing style:
- Short paragraphs (2-3 sentences max)
- Use emojis sparingly but effectively
- Casual but informative tone
- Include practical tips and hot takes
- Be engaging and relatable
- Use simple language, avoid jargon
- Add relevant hashtags at the end

You must respond with valid JSON only, no markdown code blocks. The response must be a JSON object with these exact keys:
- title: Catchy headline (max 60 chars)
- excerpt: Brief summary for card preview (max 150 chars)
- content: Full article in markdown (500-800 words)
- tags: Array of 3-5 relevant tags (without #)`,
          },
          {
            role: "user",
            content: `Write a tech blog post about: "${topic}" in the ${category} category. Make it fresh, relevant, and engaging for young tech enthusiasts in India.`,
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
