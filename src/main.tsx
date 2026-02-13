import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Development delay for testing loader (set to 0 for production)
const LOADER_DELAY_MS = 3000; // 3 seconds to preload all content

// Fade out loader after delay
const fadeOutLoader = () => {
  const loader = document.getElementById("initial-loader");
  if (loader) {
    loader.classList.add("fade-out");
    setTimeout(() => loader.remove(), 300);
  }
};

// Render React app
createRoot(document.getElementById("root")!).render(<App />);

// Add delay for development testing of loader
setTimeout(fadeOutLoader, LOADER_DELAY_MS);
