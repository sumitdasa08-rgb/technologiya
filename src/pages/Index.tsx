'use client'

import { Suspense, lazy, useState, useEffect } from 'react';
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
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy load Spline only on desktop
const SplineScene = lazy(() => import('@/components/ui/splite').then(m => ({ default: m.SplineScene })));

export default function Index() {
  const isMobile = useIsMobile();

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
        {!isMobile && (
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />
        )}
        
        <div className="flex min-h-screen flex-col-reverse md:flex-row items-center relative">
          {/* Left content */}
          <div className="flex-1 p-8 md:p-16 lg:pl-24 relative z-10 flex flex-col justify-center">
            <span className="opacity-0 animate-fade-up inline-flex items-center gap-2 text-sm font-medium text-primary tracking-wide uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 w-fit">
              Technologiya
            </span>

            <h1 className="opacity-0 animate-fade-up delay-100 text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight font-display mb-6">
              <span className="block text-foreground">Transform Your</span>
              <span className="block text-foreground">Device Problems</span>
              <span className="block gradient-text">into Solutions.</span>
            </h1>
            
            <p className="opacity-0 animate-fade-up delay-200 text-base md:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Expert computer repair, laptop repair, and device troubleshooting services. Fast, affordable, and transparent—helping individuals and businesses fix their tech issues.
            </p>

            <div className="opacity-0 animate-fade-up delay-300 flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 px-8 py-6 text-base font-medium rounded-xl shadow-lg shadow-primary/20"
                asChild
              >
                <a href="#booking" onClick={scrollToBooking}>
                  Get Started
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-border/50 bg-card/50 text-foreground hover:bg-card hover:border-primary/30 transition-colors duration-300 px-8 py-6 text-base font-medium rounded-xl"
                asChild
              >
                <Link to="/track">
                  Track Repair
                </Link>
              </Button>
            </div>
          </div>

          {/* Right content - 3D Robot (desktop only) / Static fallback (mobile) */}
          <div className="flex-1 relative h-full min-h-[250px] md:min-h-screen flex items-center justify-center">
            {isMobile ? (
              /* Lightweight mobile fallback - simple gradient orb */
              <div className="relative w-full h-[250px] flex items-center justify-center">
                <div 
                  className="w-[200px] h-[200px] rounded-full opacity-30"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(200, 200, 200, 0.4) 0%, transparent 70%)',
                  }}
                />
                <span className="absolute text-7xl">🤖</span>
              </div>
            ) : (
              <>
                {/* Silver Glass Effects - desktop only */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div 
                    className="absolute w-[600px] h-[600px] rounded-full opacity-30"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(200, 200, 200, 0.4) 0%, rgba(180, 180, 180, 0.15) 40%, transparent 70%)',
                      filter: 'blur(60px)',
                    }}
                  />
                </div>

                {/* 3D Robot - desktop only */}
                <div className="w-full h-[700px] lg:h-[800px] relative z-10">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="loader"></span>
                    </div>
                  }>
                    <SplineScene 
                      scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                      className="w-full h-full scale-125 lg:scale-150"
                    />
                  </Suspense>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-xs text-muted-foreground tracking-wider uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground to-transparent" />
        </div>
      </section>

      <LogoMarquee />
      <AboutSection />
      <ServicesSection />
      <ProcessSection />
      <BookingSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
