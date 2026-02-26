import { useEffect } from "react";
import gsap from "gsap";

/**
 * Custom cursor — uses GSAP ticker (shared with Lenis) instead of a
 * separate rAF loop to reduce frame overhead and eliminate jitter.
 */
const CustomCursor = () => {
  useEffect(() => {
    const isTouchOnly =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches;
    if (isTouchOnly) return;

    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "custom-cursor-dot";
    ring.className = "custom-cursor-ring";

    const applyColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      dot.style.background = isDark ? "#ffffff" : "#1a1a1a";
      dot.style.boxShadow = isDark
        ? "0 0 8px rgba(255,255,255,0.8), 0 0 16px rgba(255,255,255,0.4)"
        : "0 0 8px rgba(0,0,0,0.4), 0 0 16px rgba(0,0,0,0.2)";
      ring.style.border = isDark
        ? "2px solid rgba(255,255,255,0.4)"
        : "2px solid rgba(0,0,0,0.3)";
    };

    Object.assign(dot.style, {
      position: "fixed",
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: "99999",
      top: "0",
      left: "0",
      opacity: "0",
      willChange: "transform, opacity",
      transition: "opacity 0.3s ease",
    });

    Object.assign(ring.style, {
      position: "fixed",
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: "99998",
      top: "0",
      left: "0",
      opacity: "0",
      willChange: "transform, opacity",
      transition: "opacity 0.3s ease",
    });

    applyColors();
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    document.body.style.cursor = "none";
    const styleEl = document.createElement("style");
    styleEl.textContent = `*, *::before, *::after { cursor: none !important; }`;
    document.head.appendChild(styleEl);

    let timeout: ReturnType<typeof setTimeout>;
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let visible = false;

    // Use GSAP ticker instead of a separate rAF loop — single shared loop
    const tickerCallback = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate3d(${ringX - 14}px, ${ringY - 14}px, 0)`;
    };
    gsap.ticker.add(tickerCallback);

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX - 6}px, ${mouseY - 6}px, 0)`;

      if (!visible) {
        dot.style.opacity = "1";
        ring.style.opacity = "1";
        visible = true;
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        dot.style.opacity = "0";
        ring.style.opacity = "0";
        visible = false;
      }, 1500);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const observer = new MutationObserver(applyColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      gsap.ticker.remove(tickerCallback);
      observer.disconnect();
      clearTimeout(timeout);
      dot.remove();
      ring.remove();
      styleEl.remove();
      document.body.style.cursor = "";
    };
  }, []);

  return null;
};

export default CustomCursor;
