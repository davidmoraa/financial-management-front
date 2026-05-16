import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "accent" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground shadow-lift hover:bg-teal-700",
  secondary: "bg-secondary text-secondary-foreground hover:bg-teal-100",
  outline: "border border-border bg-white/75 text-foreground hover:bg-white",
  ghost: "text-muted-foreground hover:bg-teal-50 hover:text-foreground",
  accent: "bg-accent text-accent-foreground shadow-lift hover:bg-lime-300",
  danger: "bg-destructive text-destructive-foreground hover:bg-red-600",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 rounded-xl px-3 text-sm",
  md: "h-11 rounded-2xl px-4 text-sm",
  lg: "h-[3.25rem] rounded-2xl px-5 text-base",
  icon: "h-11 w-11 rounded-2xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, children, className, variant = "default", size = "md", type = "button", ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold outline-none transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      variants[variant],
      sizes[size],
      className,
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
      });
    }

    return (
      <button ref={ref} type={type} className={classes} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
