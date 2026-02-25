import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FrameBorder from "@/components/FrameBorder";
import Footer from "@/components/Footer";
import { Loader2, Eye } from "lucide-react";

const CATEGORIES = ["All", "AI", "Software", "Gadgets", "Startups", "Web3"];

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
  source: string | null;
  published_at: string;
  views: number;
}

export default function TechBlogs() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: blogs, isLoading } = useQuery({
    queryKey: ["tech-blogs", activeCategory],
    queryFn: async () => {
      let query = supabase
        .from("blogs")
        .select("*")
        .order("published_at", { ascending: false });

      if (activeCategory !== "All") {
        query = query.eq("category", activeCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TechBlog[];
    },
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

  const getExcerpt = (content: string) => {
    const plain = content.replace(/[#*_\[\]()>`-]/g, "").trim();
    return plain.length > 120 ? plain.substring(0, 120) + "..." : plain;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Tech Blogs — Daily AI & Tech News | Technologiya</title>
        <meta name="description" content="Get the latest AI, software, gadgets and startup news every day, auto-updated at 6AM." />
        <link rel="canonical" href="https://technologiya.lovable.app/blog" />
        <meta property="og:title" content="Tech Blogs — Daily AI & Tech News | Technologiya" />
        <meta property="og:description" content="Get the latest AI, software, gadgets and startup news every day." />
        <meta property="og:url" content="https://technologiya.lovable.app/blog" />
        <meta property="og:type" content="website" />
      </Helmet>

      <FrameBorder />
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-display">
              Tech Blogs 🚀
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              AI-powered insights on the latest in technology, updated daily.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {blogs && blogs.length === 0 && (
            <p className="text-center text-muted-foreground py-20">No blogs found in this category yet.</p>
          )}

          {blogs && blogs.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blog/${blog.id}`}
                  className="group block rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                >
                  {blog.image_url && (
                    <div className="h-44 overflow-hidden">
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[blog.category] || "bg-secondary text-foreground border-border"}`}>
                      {blog.category}
                    </span>
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors font-display">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{getExcerpt(blog.content)}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs text-muted-foreground">
                      <span>{formatDate(blog.published_at)}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views.toLocaleString("en-IN")}</span>
                        {blog.source && <span className="truncate max-w-[100px]">via {blog.source}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
