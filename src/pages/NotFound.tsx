import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, Search } from "lucide-react";
import { triggerHapticFeedback } from "@/hooks/use-haptic";

const NotFound = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    // Trigger visibility after mount for animations
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleButtonClick = () => {
    triggerHapticFeedback(10);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)/0.1) 0%, hsl(var(--accent)/0.1) 50%, hsl(var(--primary)/0.05) 100%)",
          }}
        />
        {/* Floating orbs */}
        <div 
          className="absolute w-72 h-72 rounded-full blur-3xl animate-float opacity-30"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary)/0.4), transparent 70%)",
            top: "10%",
            left: "10%",
          }}
        />
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(var(--accent)/0.4), transparent 70%)",
            bottom: "10%",
            right: "10%",
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        <div 
          className="absolute w-48 h-48 rounded-full blur-2xl opacity-25"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary)/0.5), transparent 70%)",
            top: "50%",
            right: "20%",
            animation: "float 10s ease-in-out infinite 2s",
          }}
        />
      </div>

      {/* Sparkles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-ping"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: "2s",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className={`relative z-10 text-center px-6 max-w-lg transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Glowing 404 */}
        <div className="relative mb-8">
          <h1 
            className="text-[120px] md:text-[180px] font-bold leading-none tracking-tighter"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 50%, hsl(var(--primary)) 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 3s ease-in-out infinite",
              textShadow: "0 0 60px hsl(var(--primary)/0.3)",
            }}
          >
            404
          </h1>
          {/* Glow effect behind text */}
          <div 
            className="absolute inset-0 blur-2xl opacity-40 -z-10"
            style={{
              background: "radial-gradient(circle at center, hsl(var(--primary)/0.5), transparent 60%)",
            }}
          />
        </div>

        {/* Fun emoji */}
        <div 
          className={`text-6xl mb-6 transition-all duration-500 delay-200 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
          style={{ animation: "float 3s ease-in-out infinite" }}
        >
          🫠
        </div>

        {/* Message */}
        <h2 
          className={`text-2xl md:text-3xl font-semibold text-foreground mb-3 transition-all duration-500 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          Oops! Page not found
        </h2>
        <p 
          className={`text-muted-foreground text-lg mb-8 transition-all duration-500 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Attempted path */}
        <div 
          className={`glass-subtle rounded-xl px-4 py-3 mb-8 inline-block transition-all duration-500 delay-500 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <code className="text-sm text-muted-foreground">
            <span className="text-primary/70">path:</span> {location.pathname}
          </code>
        </div>

        {/* Action buttons */}
        <div 
          className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-500 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Button 
            asChild 
            size="lg" 
            className="gap-2 group"
            onClick={handleButtonClick}
          >
            <Link to="/">
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Back to Home
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2 group"
            onClick={() => {
              handleButtonClick();
              window.location.reload();
            }}
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </Button>
        </div>

        {/* Fun footer text */}
        <p 
          className={`text-muted-foreground/60 text-sm mt-12 transition-all duration-500 delay-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
          Lost? Don't worry, even the best explorers take wrong turns ✨
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, hsl(var(--background)), transparent)",
        }}
      />
    </div>
  );
};

export default NotFound;
