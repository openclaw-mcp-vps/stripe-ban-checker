import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-[#1f6feb]/50 bg-[#1f6feb]/20 text-[#58a6ff]",
        warning: "border-[#d29922]/50 bg-[#d29922]/20 text-[#f2cc60]",
        danger: "border-[#f85149]/50 bg-[#f85149]/20 text-[#ff7b72]",
        success: "border-[#238636]/50 bg-[#238636]/20 text-[#3fb950]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
