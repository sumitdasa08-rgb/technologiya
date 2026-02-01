import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import InstallPrompt from "@/components/InstallPrompt";
import { Helmet } from "react-helmet-async";

// Lazy load below-the-fold components for faster initial load
const LogoMarquee = lazy(() => import("@/components/LogoMarquee"));
const WhatWeDoSection = lazy(() => import("@/components/WhatWeDoSection"));
const WhyChooseSection = lazy(() => import("@/components/WhyChooseSection"));
const ProcessSection = lazy(() => import("@/components/ProcessSection"));
const StatsSection = lazy(() => import("@/components/StatsSection"));
const WhatItTakesSection = lazy(() => import("@/components/WhatItTakesSection"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const FounderSection = lazy(() => import("@/components/FounderSection"));
const TeamGridSection = lazy(() => import("@/components/TeamGridSection"));
const TeamSection = lazy(() => import("@/components/TeamSection"));
const PrivacySection = lazy(() => import("@/components/PrivacySection"));
const BookingSection = lazy(() => import("@/components/BookingSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const TrackRepairSection = lazy(() => import("@/components/TrackRepairSection"));
const BlogPreviewSection = lazy(() => import("@/components/BlogPreviewSection"));
const Footer = lazy(() => import("@/components/Footer"));
const WhatsAppChannelBanner = lazy(() => import("@/components/WhatsAppChannelBanner"));

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
        <title>Technologiya | Device & Computer Solution Platform</title>
        <meta name="description" content="Technologiya is India's trusted device & computer solution platform. Expert computer repair, laptop repair, device troubleshooting, Windows installation, virus removal & IT support. Call 8812910655" />
        <meta name="keywords" content="Technologiya, Technologiya computer solution, Technologiya device repair, Technologiya laptop repair, Technologiya IT support, Technologiya technical service, computer repair, laptop repair, device troubleshooting" />
        <link rel="canonical" href="https://technologiya.lovable.app/" />
      </Helmet>
      <main className="min-h-screen bg-background">
        <Navbar />
        <Hero />
        <InstallPrompt />
        <Suspense fallback={<SectionSkeleton />}>
          <LogoMarquee />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <WhatWeDoSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <WhyChooseSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <ProcessSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <StatsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <WhatItTakesSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <PricingSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <ServicesSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <FounderSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <TeamGridSection />
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
          <TrackRepairSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <BlogPreviewSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Footer />
        </Suspense>
        <Suspense fallback={null}>
          <WhatsAppChannelBanner />
        </Suspense>
      </main>
    </>
  );
};

export default Index;
