"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function getProgressColor(value: number): string {
  if (value === 0) return "text-muted-foreground/40";
  if (value <= 25) return "text-red-400";
  if (value <= 50) return "text-amber-400";
  if (value <= 75) return "text-[var(--primary)]";
  return "text-emerald-400";
}

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 4,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const colorClass = getProgressColor(value);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[var(--muted)]/50"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] duration-700 ease-out",
            colorClass
          )}
        />
      </svg>
      <span
        className={cn(
          "absolute text-xs font-semibold tabular-nums",
          value === 0 ? "text-[var(--muted-foreground)]/60" : "text-[var(--foreground)]"
        )}
      >
        {value}%
      </span>
    </div>
  );
}
