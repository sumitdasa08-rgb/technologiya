import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FrameBorder from "@/components/FrameBorder";
import Footer from "@/components/Footer";
import BlogPostContent from "@/components/BlogPostContent";
import { Button } from "@/components/ui/button";

interface TechBlogData {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  source: string | null;
  published_at: string;
}

export default function TechBlogPost() {
  const { id } = useParams<{ id: string }>();

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ["tech-blog", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as TechBlogData;
    },
    enabled: !!id,
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <FrameBorder />
        <Navbar />
        <main className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Blog Not Found</h1>
            <p className="text-muted-foreground mb-6">This blog post doesn't exist.</p>
            <Button asChild><Link to="/blogs">Browse All Blogs</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{blog.title} | Technologiya</title>
        <meta name="description" content={blog.content.substring(0, 155)} />
      </Helmet>

      <FrameBorder />
      <Navbar />

      <main className="pt-24 pb-20">
        <article className="container mx-auto px-4 max-w-3xl">
          <nav className="mb-8">
            <Link to="/blogs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Blogs
            </Link>
          </nav>

          {blog.image_url && (
            <div className="rounded-2xl overflow-hidden mb-8 border border-border">
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-auto object-cover max-h-[400px]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          <header className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium border bg-primary/20 text-primary border-primary/30 mb-4">
              {blog.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 font-display leading-tight">
              {blog.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatDate(blog.published_at)}</span>
              {blog.source && <span>Source: {blog.source}</span>}
            </div>
          </header>

          <BlogPostContent content={blog.content} />
        </article>
      </main>

      <Footer />
    </div>
  );
}
