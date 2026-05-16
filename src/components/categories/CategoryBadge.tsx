import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Car,
  CircleDollarSign,
  HeartPulse,
  Home,
  Laptop,
  MoreHorizontal,
  Repeat,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category } from "@/types/finance";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  home: Home,
  "heart-pulse": HeartPulse,
  sparkles: Sparkles,
  repeat: Repeat,
  "shopping-bag": ShoppingBag,
  "more-horizontal": MoreHorizontal,
  "briefcase-business": BriefcaseBusiness,
  laptop: Laptop,
  "badge-dollar-sign": BadgeDollarSign,
  "trending-up": TrendingUp,
  "circle-dollar-sign": CircleDollarSign,
};

type CategoryBadgeProps = {
  category: Category;
  selected?: boolean;
  className?: string;
};

export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const Icon = iconMap[category.icon] ?? MoreHorizontal;
  return <Icon aria-hidden="true" className={cn("h-4 w-4", className)} />;
}

export function CategoryBadge({ category, selected, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
        category.color,
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-white",
        className,
      )}
    >
      <CategoryIcon category={category} />
      {category.name}
    </span>
  );
}
