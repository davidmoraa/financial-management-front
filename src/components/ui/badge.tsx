import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "income" | "expense" | "warning";
};

const tones = {
  neutral: "bg-slate-100 text-slate-700",
  income: "bg-emerald-100 text-emerald-700",
  expense: "bg-teal-100 text-teal-700",
  warning: "bg-amber-100 text-amber-700",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
