import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🔥" },
  { id: "Smartphones", label: "Phones", emoji: "📱" },
  { id: "Firmware", label: "Updates", emoji: "🔄" },
  { id: "AI", label: "AI", emoji: "🤖" },
  { id: "Gadgets", label: "Gadgets", emoji: "💻" },
  { id: "Tech News", label: "News", emoji: "📰" },
] as const;

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  const { triggerHaptic } = useHaptic();

  const handleSelect = (category: string) => {
    triggerHaptic();
    onSelect(category);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            "border flex items-center gap-1.5",
            selected === cat.id
              ? "bg-foreground text-background border-foreground"
              : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
          )}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
