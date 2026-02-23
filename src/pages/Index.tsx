'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { Spotlight } from "@/components/ui/spotlight";
import { SplineScene } from '@/components/ui/splite';
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
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LOADER_DURATION = 3000; // 3 seconds

export default function Index() {
  const isMobile = useIsMobile();
  const heroRef = useRef<HTMLElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroRobotRef = useRef<HTMLDivElement>(null);

  // Loading state — true on every mount (every navigation to this page)
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Lock scroll & show loader for 3s on every mount
  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo(0, 0);

    // Lock scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = '0';

    const timer = setTimeout(() => {
      setIsFadingOut(true);
      // After fade animation completes, unlock
      setTimeout(() => {
        setIsLoading(false);
        setIsFadingOut(false);
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
      }, 400); // match fade-out duration
    }, LOADER_DURATION);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, []);

  const scrollToBooking = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Parallax effect on hero section — desktop only
  useEffect(() => {
    if (!heroRef.current || isMobile) return;

    const ctx = gsap.context(() => {
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
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background">
      {/* Forced Loading Screen — shows on every mount */}
      {isLoading && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-400 ${
            isFadingOut ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ pointerEvents: isFadingOut ? 'none' : 'all' }}
        >
          {/* Background orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute w-[200px] h-[200px] rounded-full animate-pulse-soft"
              style={{
                background: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.15), transparent)',
                filter: 'blur(60px)',
                top: '20%',
                left: '10%',
              }}
            />
            <div
              className="absolute w-[150px] h-[150px] rounded-full animate-pulse-soft"
              style={{
                background: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.12), transparent)',
                filter: 'blur(60px)',
                bottom: '30%',
                right: '15%',
                animationDelay: '1s',
              }}
            />
          </div>

          {/* Bouncing dots */}
          <div className="relative z-10 flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-muted-foreground/80"
                style={{
                  animation: 'dotBounce 0.6s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main content — rendered but visually hidden behind loader */}
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
                  ...(isMobile ? {} : { filter: 'blur(60px)' }),
                }}
              />
            </div>

            {/* 3D Interactive Robot */}
            <div className={`w-full relative z-10 ${isMobile ? 'h-[350px]' : 'h-[700px] lg:h-[800px]'}`}>
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className={`w-full h-full ${isMobile ? 'scale-110' : 'scale-125 lg:scale-150'}`}
              />
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
