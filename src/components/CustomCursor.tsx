import { useEffect } from "react";

const CustomCursor = () => {
  useEffect(() => {
    // Only on non-touch desktop devices
    const isTouchOnly = window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(pointer: fine)").matches;
    if (isTouchOnly) return;

    const dot = document.createElement("div");
    const ring = document.createElement("div");

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

    // Dot styles
    Object.assign(dot.style, {
      position: "fixed",
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: "99999",
      transition: "opacity 0.3s ease, transform 0.08s ease",
      transform: "translate(-50%, -50%)",
      opacity: "0",
      top: "0px",
      left: "0px",
    });

    // Ring styles
    Object.assign(ring.style, {
      position: "fixed",
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: "99998",
      transition: "opacity 0.3s ease, transform 0.12s ease",
      transform: "translate(-50%, -50%)",
      opacity: "0",
      top: "0px",
      left: "0px",
    });

    applyColors();
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // Hide default cursor on desktop
    document.body.style.cursor = "none";
    const styleEl = document.createElement("style");
    styleEl.textContent = `*, *::before, *::after { cursor: none !important; }`;
    document.head.appendChild(styleEl);

    let timeout: ReturnType<typeof setTimeout>;

    const moveCursor = (x: number, y: number) => {
      dot.style.left = x + "px";
      dot.style.top = y + "px";
      dot.style.opacity = "1";

      setTimeout(() => {
        ring.style.left = x + "px";
        ring.style.top = y + "px";
        ring.style.opacity = "1";
      }, 80);

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        dot.style.opacity = "0";
        ring.style.opacity = "0";
      }, 1500);
    };

    const onMouseMove = (e: MouseEvent) => moveCursor(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMouseMove);

    // Watch for theme changes
    const observer = new MutationObserver(() => applyColors());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
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
