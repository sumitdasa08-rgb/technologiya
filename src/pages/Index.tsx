'use client'

import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FrameBorder from "@/components/FrameBorder";
import ScrollToTop from "@/components/ScrollToTop";
import LogoMarquee from "@/components/LogoMarquee";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import ProcessSection from "@/components/ProcessSection";
import FAQSection from "@/components/FAQSection";
import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";

export default function Index() {
  const scrollToBooking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FrameBorder />
      <Navbar />
      <ScrollToTop />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
        
        <div className="flex min-h-screen flex-col md:flex-row items-center relative">
          {/* Left content */}
          <div className="flex-1 p-8 md:p-16 lg:pl-24 relative z-10 flex flex-col justify-center">
            {/* Badge */}
            <span className="opacity-0 animate-fade-up inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 w-fit">
              Technologiya
            </span>

            {/* Main headline */}
            <h1 className="opacity-0 animate-fade-up delay-100 text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight font-display mb-6">
              <span className="block text-foreground">Transform Your</span>
              <span className="block text-foreground">Device Problems</span>
              <span className="block gradient-text">into Solutions.</span>
            </h1>
            
            {/* Subheadline */}
            <p className="opacity-0 animate-fade-up delay-200 text-base md:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Expert computer repair, laptop repair, and device troubleshooting services. Fast, affordable, and transparent—helping individuals and businesses fix their tech issues.
            </p>

            {/* CTA Buttons */}
            <div className="opacity-0 animate-fade-up delay-300 flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 px-8 py-6 text-base font-medium rounded-xl shadow-lg shadow-primary/20 hover:scale-105"
                asChild
              >
                <a href="#booking" onClick={scrollToBooking}>
                  Get Started
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-border/50 bg-card/50 text-foreground hover:bg-card hover:border-primary/30 transition-all duration-300 px-8 py-6 text-base font-medium rounded-xl"
                asChild
              >
                <Link to="/track">
                  Track Repair
                </Link>
              </Button>
            </div>
          </div>

          {/* Right content - 3D Robot with Glow Effects */}
          <div className="flex-1 relative h-full min-h-[400px] md:min-h-screen flex items-center justify-center">
            {/* Glow Effects Container */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Primary Purple Glow */}
              <div 
                className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full opacity-40"
                style={{
                  background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.5) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)',
                  filter: 'blur(60px)',
                }}
              />
              
              {/* Secondary Blue Accent Glow */}
              <div 
                className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full opacity-30 translate-x-12 translate-y-12"
                style={{
                  background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
              
              {/* Animated Pulsing Orb */}
              <div 
                className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full opacity-20 animate-pulse-soft"
                style={{
                  background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.6) 0%, transparent 60%)',
                  filter: 'blur(30px)',
                }}
              />
            </div>

            {/* 3D Robot */}
            <div className="w-full h-[500px] md:h-[700px] lg:h-[800px] relative z-10">
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full scale-110 md:scale-125 lg:scale-150"
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-xs text-muted-foreground tracking-wider uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground to-transparent" />
        </div>
      </section>

      {/* Logo Marquee */}
      <LogoMarquee />

      {/* About Section */}
      <AboutSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Process Section */}
      <ProcessSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Booking Section */}
      <BookingSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
