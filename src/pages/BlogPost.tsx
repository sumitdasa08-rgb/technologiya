 import { useEffect } from "react";
 import { Helmet } from "react-helmet-async";
 import { Link, useParams } from "react-router-dom";
 import { useQuery } from "@tanstack/react-query";
 import { ArrowLeft, Clock, Eye, Flame, Loader2 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import Navbar from "@/components/Navbar";
 import FrameBorder from "@/components/FrameBorder";
 import Footer from "@/components/Footer";
 import { Button } from "@/components/ui/button";
 import { toast } from "sonner";
 
 interface BlogPostData {
   id: string;
   title: string;
   content: string;
   excerpt: string;
   slug: string;
   category: string;
   emoji: string;
   published_at: string;
   views: number;
   fire_count: number;
   tags: string[];
 }
 
 export default function BlogPost() {
   const { slug } = useParams<{ slug: string }>();
 
   const { data: post, isLoading, error } = useQuery({
     queryKey: ["blog-post", slug],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("blog_posts")
         .select("*")
         .eq("slug", slug)
         .eq("is_published", true)
         .single();
 
       if (error) throw error;
       return data as BlogPostData;
     },
     enabled: !!slug,
   });
 
   // Increment view count
   useEffect(() => {
     if (post?.id) {
       supabase
         .from("blog_posts")
         .update({ views: (post.views || 0) + 1 })
         .eq("id", post.id)
         .then(() => {});
     }
   }, [post?.id, post?.views]);
 
   const handleFire = async () => {
     if (!post?.id) return;
     
     try {
       const { error } = await supabase
         .from("blog_posts")
         .update({ fire_count: (post.fire_count || 0) + 1 })
         .eq("id", post.id);
       
       if (error) throw error;
       toast.success("🔥 Thanks for the fire!");
     } catch {
       toast.error("Couldn't add fire right now");
     }
   };
 
   const formatDate = (dateString: string) => {
     return new Date(dateString).toLocaleDateString("en-IN", {
       day: "numeric",
       month: "short",
       year: "numeric",
     });
   };
 
   if (isLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (error || !post) {
     return (
       <div className="min-h-screen bg-background">
         <FrameBorder />
         <Navbar />
         <main className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center">
           <div className="text-center">
             <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
             <p className="text-muted-foreground mb-6">This blog post doesn't exist or has been removed.</p>
             <Button asChild>
               <Link to="/blog">Browse All Posts</Link>
             </Button>
           </div>
         </main>
         <Footer />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-background">
       <Helmet>
         <title>{post.title} | Technologiya Blog</title>
         <meta name="description" content={post.excerpt} />
         <meta property="og:title" content={post.title} />
         <meta property="og:description" content={post.excerpt} />
         <meta property="og:type" content="article" />
         <script type="application/ld+json">
           {JSON.stringify({
             "@context": "https://schema.org",
             "@type": "NewsArticle",
             headline: post.title,
             description: post.excerpt,
             datePublished: post.published_at,
             author: {
               "@type": "Organization",
               name: "Technologiya",
             },
             publisher: {
               "@type": "Organization",
               name: "Technologiya",
               logo: {
                 "@type": "ImageObject",
                 url: "https://technologiya.lovable.app/pwa-512x512.png",
               },
             },
           })}
         </script>
       </Helmet>
       
       <FrameBorder />
       <Navbar />
       
       <main className="pt-24 pb-20 relative">
         <div className="absolute inset-0 glow-accent opacity-20" />
         
         <article className="container mx-auto px-4 relative max-w-3xl">
           {/* Back link */}
           <Link 
             to="/blog" 
             className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
           >
             <ArrowLeft className="w-4 h-4" />
             Back to Blog
           </Link>
 
           {/* Header */}
           <header className="mb-8">
             <div className="flex items-center gap-3 mb-4">
               <span className="text-3xl">{post.emoji}</span>
               <span className="text-sm font-medium text-primary px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
                 {post.category}
               </span>
             </div>
             
             <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-display leading-tight">
               {post.title}
             </h1>
             
             <p className="text-lg text-muted-foreground mb-6">
               {post.excerpt}
             </p>
             
             <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
               <span className="flex items-center gap-1">
                 <Clock className="w-4 h-4" />
                 {formatDate(post.published_at)}
               </span>
               <span className="flex items-center gap-1">
                 <Eye className="w-4 h-4" />
                 {post.views} views
               </span>
               <button 
                 onClick={handleFire}
                 className="flex items-center gap-1 hover:text-primary transition-colors"
               >
                 <Flame className="w-4 h-4" />
                 {post.fire_count} 🔥
               </button>
             </div>
           </header>
 
           {/* Content */}
           <div 
             className="prose prose-invert prose-lg max-w-none
               prose-headings:font-display prose-headings:text-foreground
               prose-p:text-muted-foreground prose-p:leading-relaxed
               prose-a:text-primary prose-a:no-underline hover:prose-a:underline
               prose-strong:text-foreground
               prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
               prose-pre:bg-card prose-pre:border prose-pre:border-border
               prose-li:text-muted-foreground
               prose-blockquote:border-primary prose-blockquote:text-muted-foreground"
             dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }}
           />
 
           {/* Tags */}
           {post.tags && post.tags.length > 0 && (
             <div className="mt-12 pt-8 border-t border-border">
               <div className="flex flex-wrap gap-2">
                 {post.tags.map((tag) => (
                   <span 
                     key={tag} 
                     className="text-sm px-3 py-1 rounded-full bg-secondary text-muted-foreground"
                   >
                     #{tag}
                   </span>
                 ))}
               </div>
             </div>
           )}
         </article>
       </main>
       
       <Footer />
     </div>
   );
 }