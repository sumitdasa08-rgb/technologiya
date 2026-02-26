import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { extFetchJson, extFetch, extHeadersJson } from "@/lib/supabase-external";
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

interface Comment {
  id: string;
  blog_id: string;
  name: string;
  comment: string;
  created_at: string;
}

const REACTIONS = ["🔥", "👍", "🤯", "❤️", "🤔"];

const CATEGORY_COLORS: Record<string, string> = {
  AI: "bg-primary/20 text-primary border-primary/30",
  Software: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  Gadgets: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  Startups: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  Web3: "bg-chart-5/20 text-chart-5 border-chart-5/30",
};

export default function TechBlogPost() {
  const { id } = useParams<{ id: string }>();
  const [selectedReactions, setSelectedReactions] = useState<Set<string>>(new Set());
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ["ext-blog", id],
    queryFn: async () => {
      const data = await extFetchJson<Blog[]>(
        `/rest/v1/blogs?id=eq.${id}&select=*`
      );
      if (!data.length) throw new Error("Blog not found");
      return data[0];
    },
    enabled: !!id,
  });

  const {
    data: comments,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ["ext-comments", id],
    queryFn: () =>
      extFetchJson<Comment[]>(
        `/rest/v1/blog_comments?blog_id=eq.${id}&select=*&order=created_at.desc`
      ),
    enabled: !!id,
  });

  const handleReaction = async (emoji: string) => {
    if (selectedReactions.has(emoji)) return;
    setSelectedReactions((prev) => new Set(prev).add(emoji));
    try {
      await extFetch("/rest/v1/blog_reactions", {
        method: "POST",
        headers: { ...extHeadersJson, Prefer: "return=minimal" },
        body: JSON.stringify({
          blog_id: id,
          reaction: emoji,
          user_fingerprint: `anon-${Date.now()}`,
        }),
      });
    } catch {
      // silent
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    setSubmitting(true);
    try {
      await extFetch("/rest/v1/blog_comments", {
        method: "POST",
        headers: { ...extHeadersJson, Prefer: "return=minimal" },
        body: JSON.stringify({
          blog_id: id,
          name: commentName.trim(),
          comment: commentText.trim(),
        }),
      });
      setCommentName("");
      setCommentText("");
      refetchComments();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{blog?.title || "Blog"} | Technologiya</title>
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/blogs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> All Blogs
            </Link>
          </Button>

          {isLoading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <p className="text-destructive text-center py-10">
              {(error as Error).message}
            </p>
          )}

          {blog && (
            <article>
              {/* Header */}
              <div className="mb-8">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-4 ${
                    CATEGORY_COLORS[blog.category] ||
                    "bg-secondary text-foreground border-border"
                  }`}
                >
                  {blog.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display mb-4">
                  {blog.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {formatDate(blog.published_at)}
                </div>
              </div>

              {blog.image_url && (
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  className="w-full rounded-2xl border border-border mb-8"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-li:text-muted-foreground prose-li:marker:text-primary prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-hr:border-border prose-img:rounded-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {blog.content}
                </ReactMarkdown>
              </div>

              {/* Reactions */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4 font-display">
                  React to this post
                </h3>
                <div className="flex flex-wrap gap-3">
                  {REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className={`text-2xl px-4 py-2 rounded-xl border transition-all ${
                        selectedReactions.has(emoji)
                          ? "bg-primary/20 border-primary/40 scale-110"
                          : "bg-card border-border hover:border-primary/30 hover:scale-105"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-6 font-display">
                  Comments {comments?.length ? `(${comments.length})` : ""}
                </h3>

                <form onSubmit={handleComment} className="mb-8 space-y-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                    required
                  />
                  <textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                    required
                  />
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Posting..." : "Post Comment"}
                  </Button>
                </form>

                {comments && comments.length > 0 && (
                  <div className="space-y-4">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl bg-card border border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground text-sm">
                            {c.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(c.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
