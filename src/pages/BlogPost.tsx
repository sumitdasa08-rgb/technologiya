import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Clock, Eye, Flame, Share2, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useHaptic } from "@/hooks/use-haptic";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category: string;
  emoji: string;
  tags: string[];
  published_at: string;
  views: number;
  fire_count: number;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3 text-foreground font-display">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground font-display">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4 text-foreground font-display">$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong class="font-bold"><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/gim, '<pre class="bg-secondary rounded-xl p-4 my-4 overflow-x-auto text-sm border border-border"><code>$1</code></pre>')
    .replace(/`(.*?)`/gim, '<code class="bg-secondary px-1.5 py-0.5 rounded text-sm">$1</code>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground leading-relaxed">')
    .replace(/\n/g, '<br/>');
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { triggerHaptic } = useHaptic();
  const [copied, setCopied] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);
  const [localFireCount, setLocalFireCount] = useState(0);
  const [readProgress, setReadProgress] = useState(0);

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
      return data as BlogPost;
    },
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ["related-posts", post?.category, post?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, excerpt, slug, category, emoji, published_at, views, fire_count")
        .eq("is_published", true)
        .eq("category", post!.category)
        .neq("id", post!.id)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!post,
  });

  useEffect(() => {
    if (post) {
      setLocalFireCount(post.fire_count);
    }
  }, [post]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      setReadProgress(Math.min((scrolled / documentHeight) * 100, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    triggerHaptic();
    setCopied(true);
    toast({ title: "Link copied! 🔗", description: "Share it with your friends" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    triggerHaptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleFireClick = () => {
    if (!hasReacted) {
      triggerHaptic();
      setLocalFireCount((prev) => prev + 1);
      setHasReacted(true);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex justify-center">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-foreground mb-2 font-display">Post not found</h1>
          <p className="text-muted-foreground mb-6">This article might have been removed or doesn't exist.</p>
          <Button asChild className="rounded-xl">
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - Technologiya Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.tags?.join(", ")} />
        <link rel="canonical" href={`https://technologiya.lovable.app/blog/${post.slug}`} />
        
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://technologiya.lovable.app/blog/${post.slug}`} />
        <meta property="og:site_name" content="Technologiya" />
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:section" content={post.category} />
        {post.tags?.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        
        <meta name="robots" content="max-image-preview:large" />
        <meta name="googlebot" content="max-image-preview:large" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.published_at,
            dateModified: post.published_at,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://technologiya.lovable.app/blog/${post.slug}`,
            },
            author: {
              "@type": "Organization",
              name: "Technologiya",
              url: "https://technologiya.lovable.app",
            },
            publisher: {
              "@type": "Organization",
              name: "Technologiya",
              url: "https://technologiya.lovable.app",
              logo: {
                "@type": "ImageObject",
                url: "https://technologiya.lovable.app/pwa-512x512.png",
              },
            },
            articleSection: post.category,
            keywords: post.tags?.join(", "),
            isAccessibleForFree: true,
            speakable: {
              "@type": "SpeakableSpecification",
              cssSelector: ["h1", ".excerpt"],
            },
          })}
        </script>
      </Helmet>

      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-primary z-[60] transition-all duration-150"
        style={{ width: `${readProgress}%` }}
      />

      <main className="min-h-screen bg-background">
        <Navbar />

        <article className="pt-28 pb-20">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Back button */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">{post.emoji}</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  {post.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
                {post.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6 excerpt">{post.excerpt}</p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>{formatDate(post.published_at)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {getReadingTime(post.content)} min read
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.views} views
                </span>
              </div>
            </header>

            {/* Content */}
            <div
              className="prose prose-invert max-w-none mb-10"
              dangerouslySetInnerHTML={{
                __html: `<p class="mb-4 text-muted-foreground leading-relaxed">${renderMarkdown(post.content)}</p>`,
              }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between py-6 border-t border-b border-border">
              <button
                onClick={handleFireClick}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                  hasReacted
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <Flame className="w-5 h-5" />
                <span className="font-medium">{localFireCount}</span>
              </button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="rounded-xl">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="ml-2">{copied ? "Copied!" : "Copy Link"}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} className="rounded-xl">
                  <Share2 className="w-4 h-4" />
                  <span className="ml-2">Share</span>
                </Button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="pb-20 bg-card relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="container mx-auto px-4 max-w-5xl pt-16">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center font-display">
                More in {post.category} 🔥
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <BlogCard
                    key={related.id}
                    id={related.id}
                    title={related.title}
                    excerpt={related.excerpt}
                    slug={related.slug}
                    category={related.category}
                    emoji={related.emoji}
                    publishedAt={related.published_at}
                    views={related.views}
                    fireCount={related.fire_count}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </main>
    </>
  );
};

export default BlogPost;