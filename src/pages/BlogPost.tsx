import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Eye, Flame, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FrameBorder from "@/components/FrameBorder";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BlogPostContent from "@/components/BlogPostContent";
import RelatedPosts from "@/components/RelatedPosts";

interface BlogPostData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category: string;
  emoji: string;
  published_at: string;
  views: number;
  fire_count: number;
  tags: string[];
  cover_image_url: string | null;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      return data as BlogPostData;
    },
    enabled: !!slug,
  });

  // Increment view count
  useEffect(() => {
    if (post?.id) {
      supabase
        .from("blog_posts")
        .update({ views: (post.views || 0) + 1 })
        .eq("id", post.id)
        .then(() => {});
    }
  }, [post?.id]);

  const handleFire = async () => {
    if (!post?.id) return;
    
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ fire_count: (post.fire_count || 0) + 1 })
        .eq("id", post.id);
      
      if (error) throw error;
      toast.success("🔥 Thanks for the fire!");
    } catch {
      toast.error("Couldn't add fire right now");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <FrameBorder />
        <Navbar />
        <main className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">This blog post doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/blog">Browse All Posts</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{post.title} | Technologiya Blog</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://technologiya.lovable.app/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://technologiya.lovable.app/blog/${post.slug}`} />
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:section" content={post.category} />
        {post.tags?.map(tag => <meta key={tag} property="article:tag" content={tag} />)}
        {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        {post.cover_image_url && <meta name="twitter:image" content={post.cover_image_url} />}
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              headline: post.title,
              description: post.excerpt,
              datePublished: post.published_at,
              url: `https://technologiya.lovable.app/blog/${post.slug}`,
              ...(post.cover_image_url && { image: post.cover_image_url }),
              author: { "@type": "Organization", name: "Technologiya" },
              publisher: {
                "@type": "Organization",
                name: "Technologiya",
                logo: { "@type": "ImageObject", url: "https://technologiya.lovable.app/pwa-512x512.png" },
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://technologiya.lovable.app/" },
                { "@type": "ListItem", position: 2, name: "Blog", item: "https://technologiya.lovable.app/blog" },
                { "@type": "ListItem", position: 3, name: post.title, item: `https://technologiya.lovable.app/blog/${post.slug}` },
              ],
            },
          ])}
        </script>
      </Helmet>
      
      <FrameBorder />
      <Navbar />
      
      <main className="pt-24 pb-20 relative">
        <div className="absolute inset-0 glow-accent opacity-20" />
        
        <article className="container mx-auto px-4 relative max-w-3xl">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li>/</li>
              <li className="text-foreground truncate max-w-[200px]">{post.title}</li>
            </ol>
          </nav>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="rounded-2xl overflow-hidden mb-8 border border-border">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-auto object-cover max-h-[400px]"
                loading="eager"
              />
            </div>
          )}

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{post.emoji}</span>
              <span className="text-sm font-medium text-primary px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-display leading-tight">
              {post.title}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(post.published_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views} views
              </span>
              <button 
                onClick={handleFire}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Flame className="w-4 h-4" />
                {post.fire_count} 🔥
              </button>
            </div>
          </header>

          {/* Content - rendered as proper Markdown */}
          <BlogPostContent content={post.content} />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="text-sm px-3 py-1 rounded-full bg-secondary text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          <RelatedPosts currentPostId={post.id} category={post.category} />
        </article>
      </main>
      
      <Footer />
    </div>
  );
}
