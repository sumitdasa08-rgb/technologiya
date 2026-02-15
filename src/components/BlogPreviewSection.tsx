import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BlogCard from "./BlogCard";
import { Button } from "./ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  emoji: string;
  published_at: string;
  views: number;
  fire_count: number;
}

const BlogPreviewSection = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, excerpt, slug, category, emoji, published_at, views, fire_count")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  if (!isLoading && (!posts || posts.length === 0)) {
    return null;
  }

  return (
    <section className="py-20 relative overflow-hidden" id="blog">
      {/* Background */}
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <Sparkles className="w-4 h-4" />
            Fresh Tech Drops
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-display">
            Stay Updated with Tech 🔥
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Expert insights and analysis on the latest in tech, gadgets, and innovation — curated daily by our team.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Posts */}
        {posts && posts.length > 0 && (
          <>
            {/* Mobile: Carousel */}
            <div className="md:hidden">
              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {posts.map((post) => (
                    <CarouselItem key={post.id} className="pl-4 basis-[85%]">
                      <BlogCard
                        id={post.id}
                        title={post.title}
                        excerpt={post.excerpt}
                        slug={post.slug}
                        category={post.category}
                        emoji={post.emoji}
                        publishedAt={post.published_at}
                        views={post.views}
                        fireCount={post.fire_count}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            {/* Desktop: Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(0, 3).map((post, index) => (
                <div
                  key={post.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <BlogCard
                    id={post.id}
                    title={post.title}
                    excerpt={post.excerpt}
                    slug={post.slug}
                    category={post.category}
                    emoji={post.emoji}
                    publishedAt={post.published_at}
                    views={post.views}
                    fireCount={post.fire_count}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* View All button */}
        {posts && posts.length > 0 && (
          <div className="flex justify-center mt-10">
            <Button asChild variant="outline" className="group rounded-xl border-border hover:border-primary/50 hover:bg-primary/5">
              <Link to="/blog" className="flex items-center gap-2">
                View All Posts
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPreviewSection;