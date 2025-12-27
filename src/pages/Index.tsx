import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import TeamSection from "@/components/TeamSection";
import PrivacySection from "@/components/PrivacySection";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>TechFix Pro - Premium Computer & Mobile Repair Services | Starting ₹250</title>
        <meta name="description" content="Professional tech repair services for computers and mobiles. Windows upgrades, MS Office installation, storage troubleshooting, and more. Starting at just ₹250. Call 8812910655" />
        <meta name="keywords" content="computer repair, mobile repair, Windows upgrade, MS Office installation, tech support, affordable tech repair, phone repair near me, laptop repair service" />
      </Helmet>
      <main className="min-h-screen bg-background">
        <Navbar />
        <HeroSection />
        <ServicesSection />
        <TestimonialsSection />
        <TeamSection />
        <PrivacySection />
        <ContactSection />
        <FAQSection />
        <Footer />
        <WhatsAppButton />
      </main>
    </>
  );
};

export default Index;
