import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Socrate button.
 * Three surfaces only: solid ink, bordered card, and bare text. Radius is
 * fixed at the control radius (8px) — large radii belong to wells, not
 * controls.
 */
const buttonVariants = cva(
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium leading-none transition-[background-color,color,border-color,opacity] duration-200 ease-calm disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-ink text-card hover:bg-ink/85",
        outline:
          "border border-line-strong bg-card text-ink hover:border-ink/35 hover:bg-card",
        subtle: "bg-surface text-ink hover:bg-line",
        ghost: "text-ink-soft hover:text-ink",
        link: "h-auto p-0 text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary: "bg-surface text-ink hover:bg-line",
      },
      size: {
        sm: "h-10 px-4 text-small",
        default: "h-11 px-5 text-small",
        lg: "h-[3.125rem] px-7 text-[0.9375rem]",
        icon: "h-11 w-11 px-0",
        none: "",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      block: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, block, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
