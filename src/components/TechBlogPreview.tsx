import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";

const CATEGORY_COLORS: Record<string, string> = {
  AI: "bg-primary/20 text-primary border-primary/30",
  Software: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  Gadgets: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  Startups: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  Web3: "bg-chart-5/20 text-chart-5 border-chart-5/30",
};

interface TechBlog {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  published_at: string;
}

const TechBlogPreview = () => {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ["tech-blogs-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("id, title, content, category, image_url, published_at")
        .order("published_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as TechBlog[];
    },
  });

  if (!isLoading && (!blogs || blogs.length === 0)) return null;

  const getExcerpt = (content: string) => {
    const plain = content.replace(/[#*_\[\]()>`-]/g, "").trim();
    return plain.length > 100 ? plain.substring(0, 100) + "..." : plain;
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  return (
    <section className="py-20 relative overflow-hidden" id="tech-blogs">
      <div className="absolute inset-0 glow-accent opacity-20" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <Sparkles className="w-4 h-4" />
            AI-Powered Tech Blogs
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-display">
            Latest Tech Insights 🚀
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Freshly generated tech blogs powered by AI — covering the latest headlines.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {blogs && blogs.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.slice(0, 6).map((blog, i) => (
              <Link
                key={blog.id}
                to={`/blogs/${blog.id}`}
                className="group block rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {blog.image_url && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[blog.category] || "bg-secondary text-foreground border-border"}`}>
                    {blog.category}
                  </span>
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors font-display">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{getExcerpt(blog.content)}</p>
                  <p className="text-xs text-muted-foreground pt-1">{formatDate(blog.published_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {blogs && blogs.length > 0 && (
          <div className="flex justify-center mt-10">
            <Button asChild variant="outline" className="group rounded-xl border-border hover:border-primary/50 hover:bg-primary/5">
              <Link to="/blogs" className="flex items-center gap-2">
                View All Tech Blogs
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TechBlogPreview;
