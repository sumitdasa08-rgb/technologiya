import { Link } from "react-router-dom";
import { Clock, Flame } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  emoji: string;
  publishedAt: string;
  views: number;
  fireCount: number;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  AI: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Gadgets: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Coding: "bg-green-500/20 text-green-400 border-green-500/30",
  Gaming: "bg-red-500/20 text-red-400 border-red-500/30",
  Cybersecurity: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content?.split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

const BlogCard = ({
  id,
  title,
  excerpt,
  slug,
  category,
  emoji,
  publishedAt,
  views,
  fireCount,
  className,
}: BlogCardProps) => {
  const [localFireCount, setLocalFireCount] = useState(fireCount);
  const [hasReacted, setHasReacted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { triggerHaptic } = useHaptic();

  const handleFireClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasReacted) {
      triggerHaptic();
      setLocalFireCount((prev) => prev + 1);
      setHasReacted(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      
      // TODO: Persist to database via edge function
    }
  };

  return (
    <Link
      to={`/blog/${slug}`}
      className={cn(
        "group block glass-card rounded-2xl overflow-hidden transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl",
        "border border-border/50",
        className
      )}
    >
      {/* Emoji Header */}
      <div className="relative h-32 bg-gradient-to-br from-muted/50 to-background flex items-center justify-center overflow-hidden">
        <span 
          className="text-6xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          role="img" 
          aria-label={category}
        >
          {emoji}
        </span>
        
        {/* Floating decoration */}
        <div className="absolute top-2 right-2 opacity-20 text-4xl animate-pulse">
          {emoji}
        </div>
        
        {/* Category badge */}
        <span className={cn(
          "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium border",
          CATEGORY_COLORS[category] || "bg-muted text-foreground"
        )}>
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatDate(publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getReadingTime(excerpt)} min
            </span>
          </div>

          {/* Fire reaction */}
          <button
            onClick={handleFireClick}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all",
              hasReacted 
                ? "bg-orange-500/20 text-orange-400" 
                : "bg-muted/50 text-muted-foreground hover:bg-orange-500/10 hover:text-orange-400",
              isAnimating && "scale-125"
            )}
          >
            <Flame className={cn("w-3 h-3", isAnimating && "animate-pulse")} />
            <span>{localFireCount}</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
