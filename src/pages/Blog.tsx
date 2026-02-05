 import { useState } from "react";
 import { Helmet } from "react-helmet-async";
 import { Link } from "react-router-dom";
 import { useQuery } from "@tanstack/react-query";
 import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import Navbar from "@/components/Navbar";
 import FrameBorder from "@/components/FrameBorder";
 import Footer from "@/components/Footer";
 import BlogCard from "@/components/BlogCard";
 import { cn } from "@/lib/utils";
 import {
   Pagination,
   PaginationContent,
   PaginationItem,
   PaginationLink,
   PaginationNext,
   PaginationPrevious,
 } from "@/components/ui/pagination";
 
 interface BlogPost {
   id: string;
   title: string;
   excerpt: string;
   slug: string;
   category: string;
   emoji: string;
   published_at: string;
   views: number;
   fire_count: number;
 }
 
 const POSTS_PER_PAGE = 9;
 const CATEGORIES = [
   { id: "all", label: "All", emoji: "🔥" },
   { id: "Smartphones", label: "Phones", emoji: "📱" },
   { id: "Firmware", label: "Updates", emoji: "🔄" },
   { id: "AI", label: "AI", emoji: "🤖" },
   { id: "Gadgets", label: "Gadgets", emoji: "💻" },
   { id: "Tech News", label: "News", emoji: "📰" },
 ];
 
 export default function Blog() {
   const [selectedCategory, setSelectedCategory] = useState("all");
   const [currentPage, setCurrentPage] = useState(1);
 
   const { data: posts, isLoading } = useQuery({
     queryKey: ["blog-posts", selectedCategory, currentPage],
     queryFn: async () => {
       let query = supabase
         .from("blog_posts")
         .select("id, title, excerpt, slug, category, emoji, published_at, views, fire_count")
         .eq("is_published", true)
         .order("published_at", { ascending: false });
 
       if (selectedCategory !== "all") {
         query = query.eq("category", selectedCategory);
       }
 
       const { data, error } = await query
         .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1);
 
       if (error) throw error;
       return data as BlogPost[];
     },
   });
 
   const { data: totalCount } = useQuery({
     queryKey: ["blog-posts-count", selectedCategory],
     queryFn: async () => {
       let query = supabase
         .from("blog_posts")
         .select("id", { count: "exact", head: true })
         .eq("is_published", true);
 
       if (selectedCategory !== "all") {
         query = query.eq("category", selectedCategory);
       }
 
       const { count, error } = await query;
       if (error) throw error;
       return count || 0;
     },
   });
 
   const totalPages = Math.ceil((totalCount || 0) / POSTS_PER_PAGE);
 
   const handleCategoryChange = (category: string) => {
     setSelectedCategory(category);
     setCurrentPage(1);
   };
 
   return (
     <div className="min-h-screen bg-background">
       <Helmet>
         <title>Tech Blog | Technologiya</title>
         <meta name="description" content="Stay updated with the latest tech news, smartphone updates, firmware releases, and AI advancements. Fresh daily content for tech enthusiasts." />
       </Helmet>
       
       <FrameBorder />
       <Navbar />
       
       <main className="pt-24 pb-20 relative">
         <div className="absolute inset-0 glow-accent opacity-20" />
         
         <div className="container mx-auto px-4 relative">
           {/* Header */}
           <div className="text-center mb-12">
             <span className="inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
               <Sparkles className="w-4 h-4" />
               Tech Blog
             </span>
             <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-display">
               Fresh Tech Drops 🔥
             </h1>
             <p className="text-muted-foreground max-w-md mx-auto">
               AI-generated articles updated daily. Stay ahead of the tech curve.
             </p>
           </div>
 
           {/* Category Filter */}
           <div className="flex flex-wrap gap-2 justify-center">
             {CATEGORIES.map((cat) => (
               <button
                 key={cat.id}
                 onClick={() => handleCategoryChange(cat.id)}
                 className={cn(
                   "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                   "border flex items-center gap-1.5",
                   selectedCategory === cat.id
                     ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                     : "bg-secondary text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                 )}
               >
                 <span>{cat.emoji}</span>
                 <span>{cat.label}</span>
               </button>
             ))}
           </div>
 
           {/* Posts Grid */}
           {isLoading ? (
             <div className="flex justify-center py-20">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : posts && posts.length > 0 ? (
             <>
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                 {posts.map((post, index) => (
                   <div
                     key={post.id}
                     className="animate-fade-in"
                     style={{ animationDelay: `${index * 50}ms` }}
                   >
                     <BlogCard
                       id={post.id}
                       title={post.title}
                       excerpt={post.excerpt}
                       slug={post.slug}
                       category={post.category}
                       emoji={post.emoji}
                       publishedAt={post.published_at}
                       views={post.views}
                       fireCount={post.fire_count}
                     />
                   </div>
                 ))}
               </div>
 
               {/* Pagination */}
               {totalPages > 1 && (
                 <div className="mt-12">
                   <Pagination>
                     <PaginationContent>
                       {currentPage > 1 && (
                         <PaginationItem>
                           <PaginationPrevious
                             onClick={() => setCurrentPage((p) => p - 1)}
                             className="cursor-pointer"
                           />
                         </PaginationItem>
                       )}
                       {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                         let page: number;
                         if (totalPages <= 5) {
                           page = i + 1;
                         } else if (currentPage <= 3) {
                           page = i + 1;
                         } else if (currentPage >= totalPages - 2) {
                           page = totalPages - 4 + i;
                         } else {
                           page = currentPage - 2 + i;
                         }
                         return (
                           <PaginationItem key={page}>
                             <PaginationLink
                               onClick={() => setCurrentPage(page)}
                               isActive={currentPage === page}
                               className="cursor-pointer"
                             >
                               {page}
                             </PaginationLink>
                           </PaginationItem>
                         );
                       })}
                       {currentPage < totalPages && (
                         <PaginationItem>
                           <PaginationNext
                             onClick={() => setCurrentPage((p) => p + 1)}
                             className="cursor-pointer"
                           />
                         </PaginationItem>
                       )}
                     </PaginationContent>
                   </Pagination>
                 </div>
               )}
             </>
           ) : (
             <div className="text-center py-20">
               <p className="text-muted-foreground">No posts found in this category yet.</p>
             </div>
           )}
 
           {/* Back link */}
           <div className="text-center mt-12">
             <Link 
               to="/" 
               className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
             >
               <ArrowLeft className="w-4 h-4" />
               Back to Home
             </Link>
           </div>
         </div>
       </main>
       
       <Footer />
     </div>
   );
 }