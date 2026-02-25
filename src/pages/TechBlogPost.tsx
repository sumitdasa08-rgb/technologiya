import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Eye, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FrameBorder from "@/components/FrameBorder";
import Footer from "@/components/Footer";
import BlogPostContent from "@/components/BlogPostContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface TechBlogData {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string | null;
  source: string | null;
  published_at: string;
  views: number;
}

const REACTIONS = ["🔥", "👍", "🤯", "❤️", "🤔"] as const;

function generateFingerprint() {
  const raw = `${navigator.userAgent}|${screen.width}x${screen.height}|${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatViews(n: number) {
  return n.toLocaleString("en-IN");
}

export default function TechBlogPost() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const fingerprint = useMemo(generateFingerprint, []);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");

  // Fetch blog
  const { data: blog, isLoading, error } = useQuery({
    queryKey: ["tech-blog", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as TechBlogData;
    },
    enabled: !!id,
  });

  // Increment views on load
  useEffect(() => {
    if (!id) return;
    supabase.functions.invoke("increment-blog-views", {
      body: { blog_id: id },
    }).catch(() => {});
  }, [id]);

  // Fetch reactions
  const { data: reactionCounts } = useQuery({
    queryKey: ["blog-reactions", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_reactions")
        .select("reaction")
        .eq("blog_id", id!);
      const counts: Record<string, number> = {};
      REACTIONS.forEach(r => counts[r] = 0);
      data?.forEach((r: any) => { counts[r.reaction] = (counts[r.reaction] || 0) + 1; });
      return counts;
    },
    enabled: !!id,
  });

  // Fetch user's reactions
  const { data: userReactions } = useQuery({
    queryKey: ["user-reactions", id, fingerprint],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_reactions")
        .select("reaction")
        .eq("blog_id", id!)
        .eq("user_fingerprint", fingerprint);
      return new Set(data?.map((r: any) => r.reaction) || []);
    },
    enabled: !!id,
  });

  // Add reaction
  const addReaction = useMutation({
    mutationFn: async (reaction: string) => {
      const { error } = await supabase
        .from("blog_reactions")
        .insert({ blog_id: id!, reaction, user_fingerprint: fingerprint });
      if (error) {
        if (error.code === "23505") throw new Error("Already reacted");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-reactions", id] });
      queryClient.invalidateQueries({ queryKey: ["user-reactions", id, fingerprint] });
    },
    onError: (err: any) => {
      if (err.message === "Already reacted") {
        toast({ title: "You already reacted with this emoji!" });
      }
    },
  });

  // Fetch comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["blog-comments", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_comments")
        .select("*")
        .eq("blog_id", id!)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  // Add comment
  const addComment = useMutation({
    mutationFn: async () => {
      if (!commentName.trim() || !commentText.trim()) throw new Error("Fill all fields");
      const { error } = await supabase
        .from("blog_comments")
        .insert({ blog_id: id!, name: commentName.trim(), comment: commentText.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setCommentName("");
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["blog-comments", id] });
      toast({ title: "Comment posted!" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
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
            <Button asChild><Link to="/blog">Browse All Blogs</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canonicalUrl = `https://technologiya.lovable.app/blog/${blog.id}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{blog.title} | Technologiya</title>
        <meta name="description" content={blog.content.substring(0, 155)} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.content.substring(0, 155)} />
        <meta property="og:url" content={canonicalUrl} />
        {blog.image_url && <meta property="og:image" content={blog.image_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.content.substring(0, 155)} />
        {blog.image_url && <meta name="twitter:image" content={blog.image_url} />}
      </Helmet>

      <FrameBorder />
      <Navbar />

      <main className="pt-24 pb-20">
        <article className="container mx-auto px-4 max-w-3xl">
          <nav className="mb-8">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
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
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" /> {formatViews(blog.views)} views
              </span>
            </div>
          </header>

          <BlogPostContent content={blog.content} />

          {/* Reactions */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 font-display">React to this post</h3>
            <div className="flex flex-wrap gap-3">
              {REACTIONS.map((emoji) => {
                const isSelected = userReactions?.has(emoji);
                return (
                  <button
                    key={emoji}
                    onClick={() => !isSelected && addReaction.mutate(emoji)}
                    disabled={addReaction.isPending}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/15 shadow-sm shadow-primary/20 scale-105"
                        : "border-border bg-card hover:border-primary/40 hover:scale-105"
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-muted-foreground">{reactionCounts?.[emoji] || 0}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comments */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6 font-display">
              Comments {comments?.length ? `(${comments.length})` : ""}
            </h3>

            <div className="space-y-4 mb-8">
              <Input
                placeholder="Your name"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="rounded-xl"
              />
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="rounded-xl min-h-[100px]"
              />
              <Button
                onClick={() => addComment.mutate()}
                disabled={addComment.isPending || !commentName.trim() || !commentText.trim()}
                className="rounded-xl"
              >
                {addComment.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Comment
              </Button>
            </div>

            {commentsLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {comments && comments.length > 0 && (
              <div className="space-y-4">
                {comments.map((c: any) => (
                  <div key={c.id} className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground text-sm">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {comments && comments.length === 0 && !commentsLoading && (
              <p className="text-center text-muted-foreground text-sm py-8">No comments yet. Be the first!</p>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
