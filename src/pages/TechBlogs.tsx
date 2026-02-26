import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extFetchJson } from "@/lib/supabase-external";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Blog {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  published_at: string;
  source: string | null;
  views: number;
}

const CATEGORIES = ["All", "AI", "Software", "Gadgets", "Startups", "Web3"];

const CATEGORY_COLORS: Record<string, string> = {
  AI: "bg-primary/20 text-primary border-primary/30",
  Software: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  Gadgets: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  Startups: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  Web3: "bg-chart-5/20 text-chart-5 border-chart-5/30",
};

function getExcerpt(content: string) {
  const plain = content.replace(/[#*_\[\]()>`-]/g, "").trim();
  return plain.length > 120 ? plain.substring(0, 120) + "..." : plain;
}

function formatDate(d: string) {
  const date = new Date(d);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function TechBlogs() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: blogs, isLoading, error } = useQuery({
    queryKey: ["ext-blogs"],
    queryFn: () =>
      extFetchJson<Blog[]>("/rest/v1/blogs?select=*&order=published_at.desc"),
  });

  const filtered = blogs?.filter(
    (b) => activeCategory === "All" || b.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Tech Blogs | Technologiya</title>
        <meta name="description" content="Latest tech insights powered by AI" />
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-10">
            <Button variant="ghost" size="sm" asChild className="mb-6">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
            </Button>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-4 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
                <Sparkles className="w-4 h-4" />
                AI-Powered Tech Blogs
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground font-display">
                Latest Tech Insights 🚀
              </h1>
            </div>
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
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-center text-destructive py-10">
              {(error as Error).message}
            </p>
          )}

          {/* Grid */}
          {filtered && filtered.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((blog, i) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.id}`}
                  className="group block rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {blog.image_url && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                          CATEGORY_COLORS[blog.category] ||
                          "bg-secondary text-foreground border-border"
                        }`}
                      >
                        {blog.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(blog.published_at)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors font-display">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {getExcerpt(blog.content)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {filtered && filtered.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground py-20">
              No blogs found in this category.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
