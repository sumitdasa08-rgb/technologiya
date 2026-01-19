import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { Helmet } from "react-helmet-async";

// Lazy load below-the-fold components for faster initial load
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const TeamSection = lazy(() => import("@/components/TeamSection"));
const PrivacySection = lazy(() => import("@/components/PrivacySection"));
const BookingSection = lazy(() => import("@/components/BookingSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const Footer = lazy(() => import("@/components/Footer"));

// Minimal skeleton loader for lazy components
const SectionSkeleton = () => (
  <div className="py-16 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
  </div>
);

const Index = () => {
  return (
    <>
      <Helmet>
        <title>LogicLabs - Premium Computer & Mobile Repair Services</title>
        <meta name="description" content="Professional tech repair services for computers and mobiles. Windows upgrades, MS Office installation, storage troubleshooting, and more. Call 8812910655" />
        <meta name="keywords" content="computer repair, mobile repair, Windows upgrade, MS Office installation, tech support, phone repair near me, laptop repair service" />
      </Helmet>
      <main className="min-h-screen bg-background">
        <Navbar />
        <HeroSection />
        <Suspense fallback={<SectionSkeleton />}>
          <ServicesSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <TeamSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <PrivacySection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <BookingSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <FAQSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Footer />
        </Suspense>
      </main>
    </>
  );
};

export default Index;
