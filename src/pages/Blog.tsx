import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Search, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(9);

  const { data: posts, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["blog-posts", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("id, title, excerpt, slug, category, emoji, published_at, views, fire_count")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const filteredPosts = posts?.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedPosts = filteredPosts?.slice(0, visibleCount);
  const hasMore = filteredPosts && filteredPosts.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <>
      <Helmet>
        <title>Tech Blog - Technologiya | Latest in AI, Gadgets, Coding & More</title>
        <meta
          name="description"
          content="Stay updated with the latest tech news, AI developments, gadget reviews, coding tips, and cybersecurity guides. Fresh content daily for tech enthusiasts."
        />
        <meta name="keywords" content="tech blog, AI news, gadget reviews, coding tutorials, gaming tech, cybersecurity tips, Technologiya" />
        <link rel="canonical" href="https://technologiya.lovable.app/blog" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-12 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 glow-accent opacity-30" />
          
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-10 animate-fade-in">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
                <Sparkles className="w-4 h-4" />
                AI-Powered Tech Blog
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 font-display">
                Fresh Tech Drops 🔥
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Daily AI-generated articles about the latest in technology, 
                gadgets, coding, gaming, and cybersecurity.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="max-w-4xl mx-auto space-y-6 mb-12">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-secondary border-border"
                />
              </div>

              {/* Category Filter */}
              <CategoryFilter
                selected={selectedCategory}
                onSelect={(cat) => {
                  setSelectedCategory(cat);
                  setVisibleCount(9);
                }}
              />
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {/* Empty state */}
            {!isLoading && (!filteredPosts || filteredPosts.length === 0) && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-foreground mb-2 font-display">
                  No posts found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try a different search term"
                    : "Check back soon for new content!"}
                </p>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}

            {/* Posts grid */}
            {displayedPosts && displayedPosts.length > 0 && (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedPosts.map((post, index) => (
                    <div
                      key={post.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${(index % 6) * 50}ms` }}
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

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      className="group rounded-xl"
                    >
                      <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Blog;