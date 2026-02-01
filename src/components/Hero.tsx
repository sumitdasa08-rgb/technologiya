import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Smartphone, Monitor } from "lucide-react";

export function Hero() {
  return (
    <Card className="w-full min-h-screen bg-black/[0.96] relative overflow-hidden border-0 rounded-none">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <div className="flex h-full min-h-screen flex-col md:flex-row items-center">
        {/* Left content */}
        <div className="flex-1 p-8 md:p-16 relative z-10 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 leading-tight">
            Transform Your
            <br />
            Device Problems
            <br />
            <span className="text-primary">into Solutions</span>
          </h1>
          <p className="mt-6 text-neutral-300 max-w-lg text-base md:text-lg leading-relaxed">
            Expert tech repair services for computers, laptops, and mobile devices. 
            Fast, reliable, and professional solutions that get your devices working again.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" className="group">
              Book a Repair
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              Track Repair
            </Button>
          </div>
        </div>

        {/* Right content - Animated icons grid */}
        <div className="flex-1 relative h-full min-h-[400px] md:min-h-screen flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-square">
            {/* Animated floating icons */}
            <div className="absolute top-1/4 left-1/4 animate-pulse">
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                <Monitor className="w-10 h-10 md:w-16 md:h-16 text-primary" />
              </div>
            </div>
            <div className="absolute top-1/2 right-1/4 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 backdrop-blur-sm border border-blue-500/20 flex items-center justify-center">
                <Smartphone className="w-8 h-8 md:w-12 md:h-12 text-blue-400" />
              </div>
            </div>
            <div className="absolute bottom-1/4 left-1/3 animate-pulse" style={{ animationDelay: '1s' }}>
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-sm border border-purple-500/20 flex items-center justify-center">
                <Cpu className="w-7 h-7 md:w-10 md:h-10 text-purple-400" />
              </div>
            </div>
            
            {/* Glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/3 w-32 h-32 md:w-48 md:h-48 bg-blue-500/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default Hero;