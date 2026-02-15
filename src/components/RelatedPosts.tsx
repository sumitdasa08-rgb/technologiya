import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BlogCard from "./BlogCard";

interface RelatedPostsProps {
  currentPostId: string;
  category: string;
}

const RelatedPosts = ({ currentPostId, category }: RelatedPostsProps) => {
  const { data: posts } = useQuery({
    queryKey: ["related-posts", currentPostId, category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, excerpt, slug, category, emoji, published_at, views, fire_count, cover_image_url")
        .eq("is_published", true)
        .eq("category", category)
        .neq("id", currentPostId)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6 font-display">Related Posts</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            id={post.id}
            title={post.title}
            excerpt={post.excerpt}
            slug={post.slug}
            category={post.category}
            emoji={post.emoji}
            publishedAt={post.published_at}
            views={post.views}
            fireCount={post.fire_count}
            coverImageUrl={post.cover_image_url}
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedPosts;
