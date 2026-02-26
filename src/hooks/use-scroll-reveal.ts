import { useEffect, useRef } from "react";

/**
 * Lightweight scroll-reveal hook using IntersectionObserver.
 * Uses only GPU-accelerated properties (transform, opacity) for 60fps on mobile.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { threshold?: number; delay?: number }
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";
    el.style.transition = `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${options?.delay ?? 0}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${options?.delay ?? 0}ms`;
    el.style.willChange = "opacity, transform";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el);
          // Clean up willChange after animation
          setTimeout(() => { el.style.willChange = "auto"; }, 700 + (options?.delay ?? 0));
        }
      },
      { threshold: options?.threshold ?? 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.delay]);

  return ref;
}
