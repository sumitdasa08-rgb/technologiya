import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXT_SUPABASE_URL, EXT_SUPABASE_KEY } from "@/lib/supabase-external";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function GenerateBlog() {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setStage("Fetching latest tech news...");

    try {
      await new Promise((r) => setTimeout(r, 800));
      setStage("Writing blog with AI...");

      const res = await fetch(
        `${EXT_SUPABASE_URL}/functions/v1/generate-tech-blog`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${EXT_SUPABASE_KEY}`,
          },
          body: JSON.stringify({}),
        }
      );

      const text = await res.text();
      let result: any;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Raw response: " + text.substring(0, 300));
      }

      if (!res.ok || result.success === false) {
        throw new Error(result.error || "HTTP " + res.status);
      }

      setStage("Saving to database...");
      await new Promise((r) => setTimeout(r, 500));
      setSuccess(result.blog);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Generate Blog | Technologiya</title>
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/blogs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to Blogs
            </Link>
          </Button>

          <div className="rounded-2xl border border-border bg-card p-8">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground font-display mb-2">
              Generate Tech Blog
            </h1>
            <p className="text-muted-foreground mb-6 text-sm">
              AI-powered blog generation from latest tech headlines
            </p>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {stage}
                </>
              ) : (
                "Generate New Blog"
              )}
            </Button>

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-left">
                <p className="text-destructive text-sm font-mono break-all">
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/30 text-left space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Blog generated!</span>
                </div>
                <p className="text-foreground font-semibold">{success.title}</p>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/blogs/${success.id}`}>View Blog →</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
