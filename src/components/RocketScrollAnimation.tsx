import { useCallback } from "react";

/**
 * Lightweight CSS-only rocket animation that flies toward the booking section.
 * Uses GPU-accelerated transform + opacity only — zero layout thrashing.
 */
export function useRocketScroll() {
  const launchRocket = useCallback((onComplete?: () => void) => {
    // 🔊 Woooosh sound via white noise + frequency sweep
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const t = ctx.currentTime;

      // White noise buffer for the "shhhh" texture
      const bufferSize = ctx.sampleRate * 0.7;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      // Bandpass filter sweeps up for the "wooo → shhhh" feel
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 0.8;
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(3000, t + 0.35);
      filter.frequency.exponentialRampToValueAtTime(6000, t + 0.7);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, t);
      noiseGain.gain.linearRampToValueAtTime(0.3, t + 0.08);
      noiseGain.gain.setValueAtTime(0.3, t + 0.2);
      noiseGain.gain.linearRampToValueAtTime(0, t + 0.7);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 0.7);
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
