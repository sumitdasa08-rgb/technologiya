import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroCharacter from "@/assets/hero-character.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated gradient background - Gen Z style */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-background to-cyan-500/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      
      {/* Floating orbs for depth */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Text Content - Left Side */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="opacity-0 animate-fade-up">
              <span className="inline-flex items-center gap-2 text-sm font-medium bg-foreground/10 backdrop-blur-sm text-foreground px-4 py-2 rounded-full mb-6 border border-foreground/10">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Your Friendly Tech Heroes
                <Zap className="w-4 h-4 text-cyan-500" />
              </span>
            </div>

            <h1 className="opacity-0 animate-fade-up delay-100 text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                TechFix
              </span>{" "}
              Pro
            </h1>
            
            <p className="opacity-0 animate-fade-up delay-200 text-xl md:text-2xl text-foreground/90 font-medium mb-3">
              "Your Tech in a Wreck? 
              <span className="text-purple-500"> We Fix it</span> in a Sec!" 🔧
            </p>
            
            <p className="opacity-0 animate-fade-up delay-300 text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 font-light">
              Premium repairs with zero stress. No cap, just vibes and transparent pricing. Starting at just ₹250 ✨
            </p>

            <div className="opacity-0 animate-fade-up delay-400 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300 px-8 py-6 text-base font-medium rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
                asChild
              >
                <a href="#contact">
                  Book Now <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-foreground/20 text-foreground hover:bg-foreground/5 px-8 py-6 text-base font-medium rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-105"
                asChild
              >
                <a href="#services">Explore Services 🚀</a>
              </Button>
            </div>

            {/* Mini stats - Gen Z style pills */}
            <div className="opacity-0 animate-fade-up delay-500 mt-10 flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { emoji: "🔥", text: "500+ Fixed" },
                { emoji: "💯", text: "Transparent" },
                { emoji: "⚡", text: "24hr Service" },
                { emoji: "⭐", text: "5-Star Rated" },
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="inline-flex items-center gap-2 bg-foreground/5 backdrop-blur-sm border border-foreground/10 rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-foreground/10 transition-colors cursor-default"
                >
                  <span>{stat.emoji}</span>
                  <span>{stat.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Character - Right Side */}
          <div className="flex-1 flex justify-center lg:justify-end opacity-0 animate-fade-up delay-300">
            <div className="relative">
              {/* Glow effect behind character */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 blur-3xl scale-110 rounded-full" />
              
              {/* Character image with floating animation */}
              <div className="relative animate-[float_6s_ease-in-out_infinite]">
                <img 
                  src={heroCharacter} 
                  alt="3D Tech Repair Character" 
                  className="w-80 md:w-96 lg:w-[450px] h-auto drop-shadow-2xl"
                />
              </div>
              
              {/* Floating badges around character */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                Online Now! 🟢
              </div>
              <div className="absolute bottom-20 -left-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                Quick Fix ⚡
              </div>
              <div className="absolute top-1/3 -right-12 bg-foreground/90 text-background text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ₹250 only 💸
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-600">
        <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center backdrop-blur-sm">
          <div className="w-1 h-3 bg-foreground/40 rounded-full mt-2 animate-bounce" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
