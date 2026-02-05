 import { useState } from "react";
 import { Helmet } from "react-helmet-async";
 import { Link, useNavigate } from "react-router-dom";
 import { Package, Search, ArrowLeft, Loader2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import Navbar from "@/components/Navbar";
 import FrameBorder from "@/components/FrameBorder";
 import Footer from "@/components/Footer";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 export default function Track() {
   const [refNumber, setRefNumber] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const navigate = useNavigate();
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     const trimmedRef = refNumber.trim().toUpperCase();
     if (!trimmedRef) {
       toast.error("Please enter a reference number");
       return;
     }
 
     setIsLoading(true);
     
     try {
       const { data, error } = await supabase.functions.invoke("get-booking-status", {
         body: { short_ref: trimmedRef },
       });
 
       if (error) throw error;
       
       if (!data?.booking) {
         toast.error("No booking found with this reference number");
         return;
       }
 
       navigate(`/status?booking_id=${data.booking.id}`);
     } catch (error) {
       console.error("Track error:", error);
       toast.error("Failed to find booking. Please check the reference number.");
     } finally {
       setIsLoading(false);
     }
   };
 
   return (
     <div className="min-h-screen bg-background">
       <Helmet>
         <title>Track Your Repair | Technologiya</title>
         <meta name="description" content="Track the status of your device repair and payment at Technologiya. Enter your reference number to check progress." />
       </Helmet>
       
       <FrameBorder />
       <Navbar />
       
       <main className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center relative">
         {/* Background */}
         <div className="absolute inset-0 glow-accent opacity-20" />
         
         <div className="container mx-auto px-4 relative">
           <div className="max-w-md mx-auto text-center">
             {/* Icon */}
             <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
               <Package className="w-10 h-10 text-primary" />
             </div>
             
             {/* Header */}
             <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
               Track Your Repair
             </h1>
             
             <p className="text-muted-foreground mb-8">
               Enter your 8-character reference number to check the status of your device repair and payment.
             </p>
             
             {/* Form */}
             <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl">
               <div className="mb-4">
                 <label className="block text-sm font-medium text-foreground mb-2 text-left">
                   Reference Number
                 </label>
                 <Input
                   placeholder="e.g., A1B2C3D4"
                   value={refNumber}
                   onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
                   className="bg-secondary border-border rounded-xl h-12 text-center text-lg tracking-widest font-mono"
                   maxLength={8}
                 />
               </div>
               
               <Button
                 type="submit"
                 disabled={isLoading}
                 className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-medium shadow-lg shadow-primary/20"
               >
                 {isLoading ? (
                   <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     Searching...
                   </>
                 ) : (
                   <>
                     <Search className="w-4 h-4 mr-2" />
                     Track Repair
                   </>
                 )}
               </Button>
             </form>
             
             {/* Back link */}
             <Link 
               to="/" 
               className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mt-8 transition-colors"
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