import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
  indicatorClassName?: string;
};

export function Progress({ value, className, indicatorClassName }: ProgressProps) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-[#21262d]", className)}>
      <div className={cn("h-full bg-[#1f6feb] transition-all", indicatorClassName)} style={{ width: `${normalized}%` }} />
    </div>
  );
}
