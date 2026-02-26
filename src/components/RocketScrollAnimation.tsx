import { useCallback } from "react";

/**
 * Lightweight CSS-only rocket animation that flies toward the booking section.
 * Uses GPU-accelerated transform + opacity only — zero layout thrashing.
 */
export function useRocketScroll() {
  const launchRocket = useCallback((onComplete?: () => void) => {
    // 🔊 Rocket launch sound via Web Audio API
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Rumble bass
      const rumble = ctx.createOscillator();
      const rumbleGain = ctx.createGain();
      rumble.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);
      rumble.frequency.setValueAtTime(80, ctx.currentTime);
      rumble.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
      rumble.type = "sawtooth";
      rumbleGain.gain.setValueAtTime(0.25, ctx.currentTime);
      rumbleGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.15);
      rumbleGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      rumble.start(ctx.currentTime);
      rumble.stop(ctx.currentTime + 0.5);

      // Rising whoosh
      const whoosh = ctx.createOscillator();
      const whooshGain = ctx.createGain();
      whoosh.connect(whooshGain);
      whooshGain.connect(ctx.destination);
      whoosh.frequency.setValueAtTime(300, ctx.currentTime + 0.1);
      whoosh.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);
      whoosh.type = "sine";
      whooshGain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
      whooshGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.2);
      whooshGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.55);
      whoosh.start(ctx.currentTime + 0.1);
      whoosh.stop(ctx.currentTime + 0.55);
    } catch (_) { /* audio unsupported */ }

    // 📳 Launch-style vibration pattern (rumble → burst → trail)
    if ("vibrate" in navigator) {
      navigator.vibrate([50, 30, 80, 30, 150]);
    }

    // Create rocket element
    const rocket = document.createElement("div");
    rocket.innerHTML = "🚀";
    rocket.setAttribute("aria-hidden", "true");

    // Get booking section position to calculate angle
    const booking = document.getElementById("booking");
    const bookingY = booking
      ? booking.getBoundingClientRect().top + window.scrollY
      : window.scrollY + window.innerHeight * 3;
    const startY = window.scrollY + window.innerHeight * 0.5;
    const direction = bookingY > startY ? 1 : -1;

    Object.assign(rocket.style, {
      position: "fixed",
      left: "50%",
      top: "50%",
      fontSize: "2rem",
      zIndex: "9998",
      pointerEvents: "none",
      willChange: "transform, opacity",
      transform: `translate(-50%, -50%) rotate(${direction > 0 ? "135deg" : "-45deg"})`,
      opacity: "0",
      transition: "none",
    });

    document.body.appendChild(rocket);

    // Force reflow then animate
    rocket.getBoundingClientRect();

    // Phase 1: Fade in + slight scale
    Object.assign(rocket.style, {
      transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
      opacity: "1",
      transform: `translate(-50%, -50%) rotate(${direction > 0 ? "135deg" : "-45deg"}) scale(1.2)`,
    });

    // Phase 2: Launch away
    setTimeout(() => {
      Object.assign(rocket.style, {
        transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in",
        transform: `translate(-50%, ${direction > 0 ? "120vh" : "-120vh"}) rotate(${direction > 0 ? "135deg" : "-45deg"}) scale(0.5)`,
        opacity: "0",
      });
    }, 150);

    // Trigger scroll after brief delay
    setTimeout(() => {
      onComplete?.();
    }, 200);

    // Cleanup
    setTimeout(() => {
      rocket.remove();
    }, 700);
  }, []);

  return launchRocket;
}
