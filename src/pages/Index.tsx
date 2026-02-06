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
        
      <div className="relative min-h-screen flex items-center">
          {/* Right content - 3D Robot (positioned absolute to overlap) */}
          <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
            <div className="w-full md:w-[65%] h-full relative">
              {/* Silver Glass Effects Container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full opacity-30"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(200, 200, 200, 0.4) 0%, rgba(180, 180, 180, 0.15) 40%, transparent 70%)',
                    filter: 'blur(60px)',
                  }}
                />
                <div 
                  className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full opacity-20 translate-x-12 translate-y-12"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(220, 220, 220, 0.5) 0%, rgba(180, 180, 180, 0.2) 40%, transparent 70%)',
                    filter: 'blur(40px)',
                  }}
                />
                <div 
                  className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full opacity-15 animate-pulse-soft"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(240, 240, 240, 0.5) 0%, transparent 60%)',
                    filter: 'blur(30px)',
                  }}
                />
              </div>

              <div className="w-full h-[500px] md:h-[700px] lg:h-[800px] relative z-10 pointer-events-auto">
                <SplineScene 
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full scale-110 md:scale-125 lg:scale-150"
                />
              </div>
            </div>
          </div>

          {/* Left content - overlaps robot */}
          <div className="flex-1 p-8 md:p-16 lg:pl-24 relative z-20 flex flex-col justify-center max-w-2xl">
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

      {/* Process Section */}
      <ProcessSection />

      {/* Booking Section */}
      <BookingSection />

      {/* FAQ Section - Last before footer */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
