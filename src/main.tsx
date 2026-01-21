import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Smoothly fade out the initial loader when React hydrates
const fadeOutLoader = () => {
  const loader = document.getElementById("initial-loader");
  if (loader) {
    loader.classList.add("fade-out");
    setTimeout(() => loader.remove(), 400);
  }
};

// Small delay to ensure smooth transition
setTimeout(() => {
  createRoot(document.getElementById("root")!).render(<App />);
  fadeOutLoader();
}, 100);
