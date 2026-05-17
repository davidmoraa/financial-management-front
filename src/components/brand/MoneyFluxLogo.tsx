import moneyFluxLogo from "@/assets/money-flux-logo.jpg";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-9 w-9 rounded-xl",
  md: "h-11 w-11 rounded-2xl",
  lg: "h-14 w-14 rounded-[1.25rem]",
  xl: "h-20 w-20 rounded-[1.75rem]",
};

type MoneyFluxLogoProps = {
  size?: keyof typeof sizes;
  className?: string;
};

export function MoneyFluxLogo({ size = "md", className }: MoneyFluxLogoProps) {
  return (
    <span className={cn("block shrink-0 overflow-hidden bg-teal-950 shadow-lift ring-1 ring-white/80", sizes[size], className)}>
      <img className="h-full w-full object-cover" src={moneyFluxLogo} alt="Money Flux" />
    </span>
  );
}
