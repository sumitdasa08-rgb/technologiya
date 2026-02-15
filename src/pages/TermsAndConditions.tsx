import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import FrameBorder from "@/components/FrameBorder";
import Footer from "@/components/Footer";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms & Conditions | Technologiya</title>
        <meta name="description" content="Terms and conditions for using Technologiya's device repair and IT support services across India." />
        <link rel="canonical" href="https://technologiya.lovable.app/terms-and-conditions" />
      </Helmet>

      <FrameBorder />
      <Navbar />

      <main className="pt-24 pb-20 relative">
        <div className="absolute inset-0 glow-accent opacity-20" />
        <article className="container mx-auto px-4 relative max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 font-display">Terms & Conditions</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p>Last updated: February 2026</p>

            <h2 className="text-xl font-semibold text-foreground">1. Services</h2>
            <p>Technologiya provides device repair, laptop repair, data recovery, virus removal, and IT support services. All services are subject to availability and diagnosis.</p>

            <h2 className="text-xl font-semibold text-foreground">2. Pricing & Payment</h2>
            <p>Service prices are displayed on our website and confirmed before work begins. Payment is required upon completion of service. We accept UPI and online payments.</p>

            <h2 className="text-xl font-semibold text-foreground">3. Warranty</h2>
            <p>All repairs come with a service warranty as specified at the time of booking. Warranty does not cover physical damage, water damage, or unauthorized modifications after service.</p>

            <h2 className="text-xl font-semibold text-foreground">4. Privacy</h2>
            <p>We collect only necessary information (name, phone, email) to process your service request. Your data is never sold to third parties. Device data is handled with strict confidentiality.</p>

            <h2 className="text-xl font-semibold text-foreground">5. Limitation of Liability</h2>
            <p>Technologiya is not liable for data loss during repairs. Customers are advised to back up their data before submitting devices for service.</p>

            <h2 className="text-xl font-semibold text-foreground">6. Contact</h2>
            <p>For questions about these terms, contact us via WhatsApp at +91 88129 10655 or visit our website.</p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
