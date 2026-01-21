import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Fade out loader instantly when React is ready
const fadeOutLoader = () => {
  const loader = document.getElementById("initial-loader");
  if (loader) {
    loader.classList.add("fade-out");
    setTimeout(() => loader.remove(), 300);
  }
};

// Render immediately - no artificial delay
createRoot(document.getElementById("root")!).render(<App />);
fadeOutLoader();
