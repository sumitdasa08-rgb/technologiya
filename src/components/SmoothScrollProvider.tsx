import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Global smooth scroll provider using Lenis.
 * Provides buttery-smooth inertia scrolling on all devices.
 * Lightweight — uses rAF synced with GSAP ticker.
 */
const SmoothScrollProvider = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Sync Lenis scroll position with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Use GSAP ticker for smooth rAF loop
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Expose lenis globally so other components can use scrollTo
    (window as any).__lenis = lenis;

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  return null;
};

export default SmoothScrollProvider;
