import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FrameBorder from "@/components/FrameBorder";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle, AlertCircle } from "lucide-react";

export default function GenerateBlog() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; title?: string; error?: string } | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-tech-blog");

      if (error) throw error;

      if (data?.success) {
        setResult({ success: true, title: data.blog?.title });
      } else {
        setResult({ success: false, error: data?.error || "Unknown error" });
      }
    } catch (err: any) {
      setResult({ success: false, error: err.message || "Failed to generate blog" });
    } finally {
      setIsGenerating(false);
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

            {result && (
              <div className={`p-4 rounded-xl text-sm text-left ${
                result.success
                  ? "bg-chart-2/10 border border-chart-2/30 text-chart-2"
                  : "bg-destructive/10 border border-destructive/30 text-destructive"
              }`}>
                {result.success ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Blog generated successfully!</p>
                      <p className="mt-1 opacity-80">"{result.title}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Generation failed</p>
                      <p className="mt-1 opacity-80">{result.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
