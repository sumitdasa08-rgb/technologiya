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
    // Disable Lenis on mobile/touch devices — native scroll is smoother
    const isTouchDevice = window.matchMedia("(max-width: 767px)").matches || "ontouchstart" in window;
    if (isTouchDevice) return;

    const lenis = new Lenis({
      duration: 0.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      orientation: "vertical",
      smoothWheel: true,
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
