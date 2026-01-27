
# AI-Powered Tech Blog for Gen Z Engagement

## Overview
Create an engaging, AI-powered blog section that automatically generates daily posts about the latest developments in computers, AI, and technology. The blog will attract Gen Z visitors with modern aesthetics, interactive elements, and fresh, relevant content.

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Blog Page  │  │ Post Detail │  │ Blog Preview Section    │  │
│  │  /blog      │  │ /blog/:slug │  │ (Homepage)              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                   │
│  ┌─────────────────────┐  ┌───────────────────────────────────┐ │
│  │ generate-blog-post  │  │ blog_posts table                  │ │
│  │ (Edge Function)     │  │ - id, title, content, slug        │ │
│  │ Uses Lovable AI     │  │ - category, tags, emoji           │ │
│  └─────────────────────┘  │ - views, published_at             │ │
│                           └───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### 1. AI Content Generation
- Uses Lovable AI (google/gemini-3-flash-preview) - no API key needed
- Generates engaging, Gen Z-friendly tech articles
- Topics: AI breakthroughs, gadget reviews, coding tips, cybersecurity, gaming tech
- Auto-generates catchy titles, emojis, and relevant tags

### 2. Gen Z-Focused Design
- TikTok/Instagram-inspired card layouts with rounded corners
- Floating emojis and micro-animations
- Swipe-enabled mobile carousel (using existing Embla)
- Haptic feedback on interactions (already implemented in your codebase)
- Gradient backgrounds and glassmorphism effects
- "Fire" reaction system with animated counters

### 3. Blog Homepage Preview
- "Fresh Tech Drops" section on the main page
- 3-4 latest posts in a horizontal scroll
- Animated entrance with your existing fade-up effects
- "View All" button linking to full blog

### 4. Full Blog Page (/blog)
- Grid layout with category filters (AI, Gadgets, Coding, Gaming)
- Search functionality
- Infinite scroll or "Load More" pattern
- Reading time estimates
- Share to WhatsApp/Twitter buttons

### 5. Individual Post Page (/blog/:slug)
- Clean, readable typography
- Markdown rendering with code blocks
- Related posts section
- Social sharing
- "Back to Blog" navigation

---

## Implementation Steps

### Phase 1: Database Setup
Create a `blog_posts` table with the following structure:
- `id` (UUID, primary key)
- `title` (text) - Article headline
- `slug` (text, unique) - URL-friendly identifier
- `content` (text) - Full article in markdown
- `excerpt` (text) - Short preview text
- `category` (text) - AI, Gadgets, Coding, Gaming, Cybersecurity
- `tags` (text array) - Searchable keywords
- `emoji` (text) - Featured emoji for the card
- `cover_image_url` (text, nullable) - Optional cover image
- `views` (integer) - View counter
- `is_published` (boolean) - Draft/Published status
- `published_at` (timestamp) - Publication date
- `created_at` (timestamp)

RLS policies will allow public read access (no auth required for viewing).

### Phase 2: AI Edge Function
Create `generate-blog-post` edge function that:
1. Accepts a topic/category parameter
2. Calls Lovable AI to generate article content
3. Creates a unique slug from the title
4. Saves the post to the database
5. Can be triggered manually or via scheduled cron job

### Phase 3: Frontend Components
1. **BlogPreviewSection** - Homepage widget showing latest 4 posts
2. **BlogPage** - Full blog listing with filters
3. **BlogPostPage** - Individual article view
4. **BlogCard** - Reusable card component with Gen Z styling
5. **CategoryFilter** - Pill-style category selector

### Phase 4: Navigation & Routing
- Add "Blog" link to Navbar (both desktop and mobile)
- Create routes: `/blog` and `/blog/:slug`
- Update sitemap.xml for SEO

### Phase 5: Gen Z UX Enhancements
- Add reaction animations (fire emoji counter)
- Implement reading progress bar
- Add "Copy link" with toast feedback
- Mobile swipe gestures with haptic feedback

---

## Technical Details

### Edge Function Structure
The AI edge function will use your existing LOVABLE_API_KEY secret (already configured) to call the Lovable AI gateway with streaming disabled for content generation.

### Database Queries
- Fetch latest posts: Order by `published_at DESC`, limit 10
- Filter by category: WHERE clause on category column
- Increment views: Update on post page load
- Search: Full-text search on title and content

### Styling Approach
- Reuse existing glassmorphism classes (.glass, .glass-card)
- Apply existing animations (fade-up, scale-up, float)
- Match the monochrome color scheme with emoji accents
- Use Inter font family (already loaded)

### SEO Optimization
- Dynamic meta tags using react-helmet-async
- Structured data for blog posts (Article schema)
- Automatic sitemap updates

---

## Files to Create/Modify

### New Files
- `src/pages/Blog.tsx` - Blog listing page
- `src/pages/BlogPost.tsx` - Individual post page  
- `src/components/BlogPreviewSection.tsx` - Homepage preview
- `src/components/BlogCard.tsx` - Reusable post card
- `src/components/CategoryFilter.tsx` - Category pills
- `supabase/functions/generate-blog-post/index.ts` - AI generation

### Modified Files
- `src/App.tsx` - Add new routes
- `src/pages/Index.tsx` - Add BlogPreviewSection
- `src/components/Navbar.tsx` - Add Blog link
- `src/components/Footer.tsx` - Add Blog link
- `public/sitemap.xml` - Add blog URLs
- `supabase/config.toml` - Register new edge function

---

## Sample Blog Categories & Topics

| Category | Example Topics |
|----------|----------------|
| AI | ChatGPT updates, AI image generators, Machine learning basics |
| Gadgets | Latest iPhone features, Budget laptops 2025, Smart home devices |
| Coding | JavaScript tips, Python for beginners, Web dev trends |
| Gaming | GPU comparisons, Mobile gaming, Cloud gaming services |
| Cybersecurity | Password managers, VPN guide, Phishing protection |

---

## Content Generation Approach

The AI will be prompted to write in a Gen Z-friendly voice:
- Short paragraphs (2-3 sentences max)
- Use of emojis where appropriate
- Casual but informative tone
- Include practical tips and "hot takes"
- Reference trending topics and memes (when relevant)

---

## Outcome

After implementation, Technologiya will have:
1. A dynamic blog that updates with fresh AI-generated tech content
2. Increased organic traffic from tech-related searches
3. Higher engagement from Gen Z visitors
4. A reason for visitors to return regularly
5. Improved SEO through regular content updates
6. Shareable content for social media reach
