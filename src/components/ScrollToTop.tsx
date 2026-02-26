import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace("#", "");

      const scrollToHash = () => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      };

      // If navigating to home with hash, wait for loader to fully unlock body
      // Loader: 3000ms + 400ms fade = 3400ms body lock, add buffer
      if (pathname === "/") {
        const timer = setTimeout(scrollToHash, 3800);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(scrollToHash, 100);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
