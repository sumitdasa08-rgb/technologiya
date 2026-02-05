 import { useEffect, useState } from "react";
 import { Helmet } from "react-helmet-async";
 import { Link, useSearchParams } from "react-router-dom";
 import { CheckCircle2, Clock, AlertCircle, Copy, ArrowLeft, Loader2, IndianRupee, Package } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import Navbar from "@/components/Navbar";
 import FrameBorder from "@/components/FrameBorder";
 import Footer from "@/components/Footer";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 // Import QR codes for fixed amounts
 import qr100 from "@/assets/payment-qr-100.jpg";
 import qr200 from "@/assets/payment-qr-200.jpg";
 import qr250 from "@/assets/payment-qr-250.jpg";
 import qr300 from "@/assets/payment-qr-300.jpg";
 import qr350 from "@/assets/payment-qr-350.jpg";
 
 interface Booking {
   id: string;
   short_ref: string;
   customer_name: string;
   amount: number;
   payment_status: string;
   repair_status: string;
   created_at: string;
 }
 
 const QR_MAP: Record<number, string> = {
   100: qr100,
   200: qr200,
   250: qr250,
   300: qr300,
   350: qr350,
 };
 
 export default function Status() {
   const [searchParams] = useSearchParams();
   const bookingId = searchParams.get("booking_id");
   const [booking, setBooking] = useState<Booking | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
 
   useEffect(() => {
     const fetchBooking = async () => {
       if (!bookingId) {
         setError("No booking ID provided");
         setIsLoading(false);
         return;
       }
 
       try {
         const { data, error: fetchError } = await supabase.functions.invoke("get-booking-status", {
           body: { booking_id: bookingId },
         });
 
         if (fetchError) throw fetchError;
         
         if (!data?.booking) {
           setError("Booking not found");
           return;
         }
 
         setBooking(data.booking);
       } catch (err) {
         console.error("Fetch error:", err);
         setError("Failed to load booking details");
       } finally {
         setIsLoading(false);
       }
     };
 
     fetchBooking();
     
     // Poll for updates every 30 seconds
     const interval = setInterval(fetchBooking, 30000);
     return () => clearInterval(interval);
   }, [bookingId]);
 
   const copyRef = () => {
     if (booking?.short_ref) {
       navigator.clipboard.writeText(booking.short_ref);
       toast.success("Reference number copied!");
     }
   };
 
   const getStatusIcon = (status: string) => {
     switch (status) {
       case "confirmed":
       case "completed":
         return <CheckCircle2 className="w-5 h-5 text-primary" />;
       case "processing":
       case "pending":
       case "in_progress":
         return <Clock className="w-5 h-5 text-accent-foreground" />;
       default:
         return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
     }
   };
 
   const getStatusText = (status: string) => {
     return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
   };
 
   const qrImage = booking ? QR_MAP[booking.amount] : null;
 
   return (
     <div className="min-h-screen bg-background">
       <Helmet>
         <title>Booking Status | Technologiya</title>
         <meta name="description" content="View your repair booking status and complete payment at Technologiya." />
       </Helmet>
       
       <FrameBorder />
       <Navbar />
       
       <main className="pt-24 pb-20 min-h-[80vh] relative">
         <div className="absolute inset-0 glow-accent opacity-20" />
         
         <div className="container mx-auto px-4 relative">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20">
               <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
               <p className="text-muted-foreground">Loading booking details...</p>
             </div>
           ) : error ? (
             <div className="max-w-md mx-auto text-center py-20">
               <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
               <h1 className="text-2xl font-bold text-foreground mb-2">Oops!</h1>
               <p className="text-muted-foreground mb-6">{error}</p>
               <Button asChild>
                 <Link to="/track">Track Another Booking</Link>
               </Button>
             </div>
           ) : booking ? (
             <div className="max-w-lg mx-auto">
               {/* Header */}
               <div className="text-center mb-8">
                 <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                   <Package className="w-8 h-8 text-primary" />
                 </div>
                 <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
                   Booking Status
                 </h1>
                 <p className="text-muted-foreground mt-2">
                   Hi {booking.customer_name.split(" ")[0]}! Here's your booking status.
                 </p>
               </div>
 
               {/* Reference Card */}
               <div className="glass-card p-6 rounded-2xl mb-6">
                 <div className="flex items-center justify-between mb-4">
                   <span className="text-sm text-muted-foreground">Reference Number</span>
                   <Button variant="ghost" size="sm" onClick={copyRef} className="gap-1">
                     <Copy className="w-3 h-3" />
                     Copy
                   </Button>
                 </div>
                 <p className="text-2xl font-mono font-bold text-foreground tracking-widest text-center">
                   {booking.short_ref}
                 </p>
               </div>
 
               {/* Status Cards */}
               <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="glass-card p-4 rounded-xl">
                   <p className="text-xs text-muted-foreground mb-2">Payment Status</p>
                   <div className="flex items-center gap-2">
                     {getStatusIcon(booking.payment_status)}
                     <span className="font-medium text-foreground">
                       {getStatusText(booking.payment_status)}
                     </span>
                   </div>
                 </div>
                 <div className="glass-card p-4 rounded-xl">
                   <p className="text-xs text-muted-foreground mb-2">Repair Status</p>
                   <div className="flex items-center gap-2">
                     {getStatusIcon(booking.repair_status)}
                     <span className="font-medium text-foreground">
                       {getStatusText(booking.repair_status)}
                     </span>
                   </div>
                 </div>
               </div>
 
               {/* Payment Section - Only show if payment not confirmed */}
               {booking.payment_status !== "confirmed" && qrImage && (
                 <div className="glass-card p-6 rounded-2xl mb-6 border border-border">
                   <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
                     Complete Payment
                   </h2>
                   
                   <div className="flex items-center justify-center gap-2 mb-4">
                     <IndianRupee className="w-6 h-6 text-primary" />
                     <span className="text-3xl font-bold text-foreground">{booking.amount}</span>
                   </div>
                   
                   <div className="bg-background p-4 rounded-xl mx-auto w-fit border border-border">
                     <img 
                       src={qrImage} 
                       alt={`UPI QR Code for ₹${booking.amount}`} 
                       className="w-48 h-48 object-contain"
                     />
                   </div>
                   
                   <p className="text-sm text-muted-foreground text-center mt-4">
                     Scan with any UPI app to pay. Your status will update automatically.
                   </p>
                 </div>
               )}
 
               {/* Payment Confirmed */}
               {booking.payment_status === "confirmed" && (
                 <div className="glass-card p-6 rounded-2xl mb-6 border border-primary/30 bg-primary/5">
                   <div className="flex items-center justify-center gap-2 text-primary">
                     <CheckCircle2 className="w-6 h-6" />
                     <span className="font-semibold">Payment Confirmed!</span>
                   </div>
                   <p className="text-sm text-muted-foreground text-center mt-2">
                     Thank you for your payment. We'll start working on your device.
                   </p>
                 </div>
               )}
 
               {/* Back link */}
               <div className="text-center">
                 <Link 
                   to="/" 
                   className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   Back to Home
                 </Link>
               </div>
             </div>
           ) : null}
         </div>
       </main>
       
       <Footer />
     </div>
   );
 }