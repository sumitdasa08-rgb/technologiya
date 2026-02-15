

## SEO Ranking Boost Plan

This plan focuses on fixing critical SEO issues that are actively hurting your Google rankings and implementing best practices to climb higher in search results.

---

### 1. Remove "AI-Generated" Labels (Critical - Google Penalty Risk)

Google's Helpful Content Update actively demotes sites that label content as AI-generated. Two places currently say this:

- **Blog page header**: "AI-generated articles updated daily"
- **Blog preview section on homepage**: "AI-generated articles about the latest in tech"

These will be replaced with authority-building copy like "Expert insights and analysis" and "Curated daily by our tech team."

---

### 2. Add Structured Data to Blog Listing Page

The `/blog` page is missing JSON-LD structured data. Adding a `CollectionPage` schema will help Google understand and display the blog in search results with rich snippets.

---

### 3. Improve Blog Post SEO Meta Tags

Each blog post page (`/blog/:slug`) needs:
- Canonical URL tag
- `article:published_time` and `article:section` Open Graph tags
- Twitter card meta tags
- Better `BreadcrumbList` structured data for navigation breadcrumbs in search results

---

### 4. Add Breadcrumb Navigation to Blog Posts

Google displays breadcrumbs in search results (Home > Blog > Post Title). Adding both visual breadcrumbs and `BreadcrumbList` JSON-LD structured data will improve click-through rates from search.

---

### 5. Fix Footer Copyright Year

The footer says "2025" but the current year is 2026. This signals to Google that the site is not maintained.

---

### 6. Improve Internal Linking

- Add a "Related Posts" section at the bottom of each blog post (fetch 3 posts from the same category). This keeps users on the site longer (lower bounce rate) and helps Google discover more pages.
- Ensure the blog preview section on the homepage passes `coverImageUrl` to cards for better visual engagement.

---

### 7. Add Missing Route for Terms & Conditions

The sitemap and footer reference `/terms-and-conditions` but there's no route for it in `App.tsx`. This creates 404 errors that hurt SEO. A simple terms page will be added.

---

### Technical Details

**Files to modify:**
- `src/pages/Blog.tsx` - Remove AI labels, add JSON-LD CollectionPage schema
- `src/pages/BlogPost.tsx` - Add canonical URL, breadcrumbs (visual + JSON-LD), Twitter cards, related posts section
- `src/components/BlogPreviewSection.tsx` - Remove AI-generated text, pass coverImageUrl
- `src/components/Footer.tsx` - Fix copyright year to 2026
- `src/App.tsx` - Add `/terms-and-conditions` route

**New files:**
- `src/pages/TermsAndConditions.tsx` - Basic terms page
- `src/components/RelatedPosts.tsx` - Related posts component for blog post pages

**Key changes in blog post structured data:**
- Add `BreadcrumbList` JSON-LD
- Add canonical `<link>` tag
- Add `article:published_time`, `article:section`, `article:tag` OG meta
- Add Twitter card meta tags

