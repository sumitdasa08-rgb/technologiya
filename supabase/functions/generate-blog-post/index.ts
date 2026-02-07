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

async function checkTodayPostExists(supabase: ReturnType<typeof createClient>): Promise<boolean> {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const istDateStr = istNow.toISOString().split("T")[0];

  const istDayStart = new Date(`${istDateStr}T00:00:00+05:30`);
  const istDayEnd = new Date(`${istDateStr}T23:59:59+05:30`);

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id")
    .gte("published_at", istDayStart.toISOString())
    .lte("published_at", istDayEnd.toISOString())
    .limit(1);

  if (error) {
    console.error("Error checking today's posts:", error);
    return false;
  }

  return data && data.length > 0;
}

async function callAIWithRetry(
  apiKey: string,
  category: Category,
  topic: string,
  maxRetries = 2
): Promise<{ title: string; excerpt: string; content: string; tags: string[] }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      console.log(`Retry attempt ${attempt}/${maxRetries}...`);
      await new Promise((r) => setTimeout(r, attempt * 3000));
    }

    try {
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
- Make it feel like breaking news or insider info
- Include specific version numbers, dates, and device names when relevant

IMPORTANT: For every product or device mentioned, include buy/check links from Amazon India and Flipkart. 
Format buy links as: [Buy on Amazon](https://www.amazon.in/s?k=PRODUCT+NAME) | [Check on Flipkart](https://www.flipkart.com/search?q=PRODUCT+NAME)
Include max 3 buy link sections for the top products.

You must respond with valid JSON only, no markdown code blocks. The response must be a JSON object with these exact keys:
- title: Catchy headline (max 60 chars, include device/brand name)
- excerpt: Brief summary for card preview (max 150 chars, hook the reader)
- content: Full article in markdown (600-900 words, include subheadings, buy links)
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
- Buy links for the top 3 products mentioned (Amazon India + Flipkart search URLs)

Current date context: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
            },
          ],
          temperature: 0.8,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error(`AI API error (attempt ${attempt}):`, aiResponse.status, errorText);

        if (aiResponse.status === 402) {
          throw new Error("AI credits exhausted. Please add credits.");
        }

        if (aiResponse.status === 429 || aiResponse.status >= 500) {
          lastError = new Error(`AI API error: ${aiResponse.status}`);
          continue;
        }

        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const rawContent = aiData.choices?.[0]?.message?.content;

      if (!rawContent) {
        lastError = new Error("No content received from AI");
        continue;
      }

      console.log("Raw AI response:", rawContent.substring(0, 200));

      let cleanContent = rawContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }

      const parsedContent = JSON.parse(cleanContent);
      const { title, excerpt, content, tags } = parsedContent;

      if (!title || !excerpt || !content) {
        lastError = new Error("AI response missing required fields");
        continue;
      }

      return { title, excerpt, content, tags: tags || [] };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (
        lastError.message.includes("credits exhausted") ||
        lastError.message.includes("not configured")
      ) {
        throw lastError;
      }
      console.error(`Attempt ${attempt} failed:`, lastError.message);
    }
  }

  throw lastError || new Error("All retry attempts failed");
}

async function generateCoverImage(
  apiKey: string,
  title: string,
  category: string,
  supabase: ReturnType<typeof createClient>
): Promise<string | null> {
  try {
    console.log("Generating cover image for:", title);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: `Generate a modern, eye-catching 16:9 blog cover image for a tech article titled "${title}" in the ${category} category. The image should be clean, professional, and vibrant with modern tech aesthetics. Include relevant tech imagery like devices, circuits, or digital elements. No text in the image. Ultra high resolution.`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error("Image generation API error:", response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl || !imageUrl.startsWith("data:image")) {
      console.error("No valid image in response");
      return null;
    }

    // Extract base64 data
    const base64Data = imageUrl.split(",")[1];
    if (!base64Data) return null;

    const binaryStr = atob(base64Data);
    const binaryData = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      binaryData[i] = binaryStr.charCodeAt(i);
    }

    // Upload to storage
    const fileName = `cover-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("blog-covers")
      .upload(fileName, binaryData, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("blog-covers")
      .getPublicUrl(fileName);

    console.log("Cover image uploaded:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err) {
    console.error("Cover image generation failed:", err);
    return null;
  }
}

async function postToTwitter(
  title: string,
  slug: string,
  excerpt: string,
  category: string
): Promise<void> {
  const consumerKey = Deno.env.get("TWITTER_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("TWITTER_CONSUMER_SECRET");
  const accessToken = Deno.env.get("TWITTER_ACCESS_TOKEN");
  const accessTokenSecret = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET");

  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
    console.log("Twitter API keys not configured, skipping tweet.");
    return;
  }

  try {
    const blogUrl = `https://technologiya.lovable.app/blog/${slug}`;
    const tweetText = `🔥 New Blog: ${title}\n\n${excerpt}\n\n📖 Read more: ${blogUrl}\n\n#${category.replace(/\s+/g, "")} #TechNews #Technologiya`;

    // OAuth 1.0a signature generation
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomUUID().replace(/-/g, "");

    const params: Record<string, string> = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: "1.0",
    };

    const sortedParams = Object.keys(params)
      .sort()
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join("&");

    const baseString = `POST&${encodeURIComponent("https://api.x.com/2/tweets")}&${encodeURIComponent(sortedParams)}`;
    const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(signingKey),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(baseString));
    const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));

    const authHeader = `OAuth oauth_consumer_key="${encodeURIComponent(consumerKey)}", oauth_nonce="${encodeURIComponent(nonce)}", oauth_signature="${encodeURIComponent(signature)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_token="${encodeURIComponent(accessToken)}", oauth_version="1.0"`;

    const tweetResponse = await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: tweetText }),
    });

    if (!tweetResponse.ok) {
      const errorData = await tweetResponse.text();
      console.error("Twitter API error:", tweetResponse.status, errorData);
      return;
    }

    console.log("Tweet posted successfully!");
  } catch (err) {
    console.error("Failed to post tweet:", err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials are not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let requestedCategory: Category | undefined;
    let skipDuplicateCheck = false;
    try {
      const body = await req.json();
      if (body.category && CATEGORIES.includes(body.category)) {
        requestedCategory = body.category as Category;
      }
      if (body.skip_check) skipDuplicateCheck = true;
    } catch {
      // No body or invalid JSON
    }

    if (!skipDuplicateCheck) {
      const alreadyExists = await checkTodayPostExists(supabase);
      if (alreadyExists) {
        console.log("Today's blog post already exists. Skipping generation.");
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "Post already exists for today" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const category = requestedCategory || getRandomItem([...CATEGORIES]);
    const topic = getRandomItem(TOPIC_PROMPTS[category]);
    const emoji = getRandomItem(EMOJIS[category]);

    console.log(`Generating blog post for category: ${category}, topic: ${topic}`);

    // Generate content and cover image in parallel
    const [blogContent, coverImageUrl] = await Promise.all([
      callAIWithRetry(LOVABLE_API_KEY, category, topic),
      generateCoverImage(LOVABLE_API_KEY, topic, category, supabase),
    ]);

    const { title, excerpt, content, tags } = blogContent;
    const timestamp = Date.now().toString(36);
    const slug = `${createSlug(title)}-${timestamp}`;

    const { data: post, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        title,
        slug,
        content,
        excerpt,
        category,
        tags,
        emoji,
        cover_image_url: coverImageUrl,
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

    // Post to Twitter (non-blocking)
    postToTwitter(title, slug, excerpt, category).catch((err) =>
      console.error("Twitter post failed:", err)
    );

    return new Response(
      JSON.stringify({
        success: true,
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          category: post.category,
          cover_image_url: coverImageUrl,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating blog post:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
