import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FrameBorder from "@/components/FrameBorder";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";

export default function GenerateBlog() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState<{ success: boolean; title?: string; id?: string; error?: string } | null>(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      setStage("Fetching latest tech news...");
      await new Promise((r) => setTimeout(r, 800));

      setStage("Writing blog with AI...");

      const { data: { session } } = await supabase.auth.getSession();
      void session;

      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-tech-blog`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${anonKey}`,
            "apikey": anonKey,
          },
          body: JSON.stringify({}),
        }
      );

      const responseText = await response.text();
      let generatedResult: any = {};

      try {
        generatedResult = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 300)}`);
      }

      if (!response.ok || generatedResult.success === false) {
        throw new Error(generatedResult.error || "Unknown error from edge function");
      }

      setStage("Saving to database...");
      await new Promise((r) => setTimeout(r, 500));

      setResult({
        success: true,
        title: generatedResult.blog?.title,
        id: generatedResult.blog?.id,
      });
    } catch (err: any) {
      setResult({ success: false, error: err?.message || "Failed to generate blog" });
    } finally {
      setIsGenerating(false);
      setStage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Generate Blog | Technologiya</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <FrameBorder />
      <Navbar />

      <main className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md text-center">
          <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground font-display mb-2">
                Generate Today's Blog
              </h1>
              <p className="text-sm text-muted-foreground">
                Fetches latest tech news and generates an AI-powered blog post.
              </p>
            </div>

            {isGenerating && (
              <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm font-medium text-primary">{stage}</span>
              </div>
            )}

            {!result && (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full rounded-xl"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Blog Post
                  </>
                )}
              </Button>
            )}

            {result && result.success && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-chart-2/10 border border-chart-2/30 text-chart-2 text-sm text-left">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Blog generated successfully!</p>
                      <p className="mt-1 opacity-80">"{result.title}"</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  {result.id && (
                    <Button
                      onClick={() => navigate(`/blog/${result.id}`)}
                      className="flex-1 rounded-xl"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Blog
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => { setResult(null); }}
                    className="flex-1 rounded-xl"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate Another
                  </Button>
                </div>
              </div>
            )}

            {result && !result.success && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-left">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Error: {result.error}</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => { setResult(null); }}
                  className="w-full rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
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
