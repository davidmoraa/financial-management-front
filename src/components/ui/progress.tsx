import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
  indicatorClassName?: string;
};

export function Progress({ value, className, indicatorClassName }: ProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-3 w-full overflow-hidden rounded-full bg-teal-50", className)}>
      <div
        className={cn("h-full rounded-full bg-primary transition-all duration-500 ease-out", indicatorClassName)}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
