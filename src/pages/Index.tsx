'use client'

import { Suspense, lazy, useEffect, useRef } from 'react';
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
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Lazy load Spline
const SplineScene = lazy(() => import('@/components/ui/splite').then(m => ({ default: m.SplineScene })));

gsap.registerPlugin(ScrollTrigger);

export default function Index() {
  const isMobile = useIsMobile();
  const heroRef = useRef<HTMLElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroRobotRef = useRef<HTMLDivElement>(null);

  const scrollToBooking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Parallax effect on hero section
  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // Text moves up slower (parallax depth)
      if (heroTextRef.current) {
        gsap.to(heroTextRef.current, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }

      // Robot moves up faster
      if (heroRobotRef.current) {
        gsap.to(heroRobotRef.current, {
          yPercent: -35,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <FrameBorder />
      <Navbar />
      <ScrollToTop />

      {/* Hero Section with parallax */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden">
        {!isMobile && (
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />
        )}
        
        <div className="flex min-h-screen flex-col-reverse md:flex-row items-center relative">
          {/* Left content - parallax layer */}
          <div ref={heroTextRef} className="flex-1 p-8 md:p-16 lg:pl-24 relative z-10 flex flex-col justify-center will-change-transform">
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

          {/* Right content - 3D Robot on all devices - parallax layer */}
          <div ref={heroRobotRef} className="flex-1 relative h-full min-h-[300px] md:min-h-screen flex items-center justify-center will-change-transform">
            {/* Glow effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="absolute w-[250px] h-[250px] md:w-[600px] md:h-[600px] rounded-full opacity-30"
                style={{
                  background: 'radial-gradient(circle at center, rgba(200, 200, 200, 0.4) 0%, rgba(180, 180, 180, 0.15) 40%, transparent 70%)',
                  filter: isMobile ? undefined : 'blur(60px)',
                }}
              />
            </div>

            {/* 3D Interactive Robot - all devices */}
            <div className={`w-full relative z-10 ${isMobile ? 'h-[350px]' : 'h-[700px] lg:h-[800px]'}`}>
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <span className="loader"></span>
                </div>
              }>
                <SplineScene 
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className={`w-full h-full ${isMobile ? 'scale-110' : 'scale-125 lg:scale-150'}`}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-[fade-in_1s_ease-out_1s_forwards]" style={{ opacity: 0 }}>
          <span className="text-xs text-muted-foreground tracking-wider uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground to-transparent animate-[fade-in_2s_ease-in-out_infinite_alternate]" />
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
