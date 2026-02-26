import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = (window as any).__lenis;

    if (hash) {
      const targetId = hash.replace("#", "");

      const scrollToHash = () => {
        const el = document.getElementById(targetId);
        if (el) {
          if (lenis) {
            lenis.scrollTo(el, { duration: 1.5, offset: -20 });
          } else {
            el.scrollIntoView({ behavior: "smooth" });
          }
          // Clear hash so refresh starts clean at top
          setTimeout(() => {
            navigate(pathname, { replace: true });
          }, 1500);
        }
      };

      // If navigating to home with hash, wait for loader to fully unlock body
      if (pathname === "/") {
        const timer = setTimeout(scrollToHash, 3800);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(scrollToHash, 100);
        return () => clearTimeout(timer);
      }
    } else {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname, hash, navigate]);

  return null;
};

export default ScrollToTop;
