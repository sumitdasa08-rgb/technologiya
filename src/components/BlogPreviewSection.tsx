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
  CarouselNext,
  CarouselPrevious,
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

  // Don't render section if no posts
  if (!isLoading && (!posts || posts.length === 0)) {
    return null;
  }

  return (
    <section className="py-20 relative overflow-hidden" id="blog">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl opacity-10 animate-pulse">🔥</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-10 animate-pulse delay-300">✨</div>
        <div className="absolute top-40 right-20 text-3xl opacity-10 animate-pulse delay-500">🚀</div>
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Fresh Tech Drops</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stay Updated with Tech 🔥
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            AI-generated articles about the latest in tech, gadgets, coding, and more. 
            Updated daily for the curious minds.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        )}

        {/* Posts carousel for mobile, grid for desktop */}
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
            <Button asChild variant="outline" className="group">
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
