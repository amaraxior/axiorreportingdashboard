"use client";

import { cn } from "@/lib/utils";
import { ProgressRing } from "./progress-ring";
import type { FeatureItem, FeatureStatus } from "@/data/types";
import type { LucideIcon } from "lucide-react";
import {
  FileCode,
  Store,
  GitBranch,
  Database,
  Layers,
  Brain,
  Eye,
  Award,
  ShieldCheck,
  Network,
  RefreshCw,
  CircleDot,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  FileCode,
  Store,
  GitBranch,
  Database,
  Layers,
  Brain,
  Eye,
  Award,
  ShieldCheck,
  Network,
  RefreshCw,
};

const statusConfig: Record<
  FeatureStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  "not-started": {
    label: "Not Started",
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    dot: "bg-zinc-400",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-[var(--primary)]/10",
    text: "text-[var(--primary)]",
    dot: "bg-[var(--primary)]",
  },
  beta: {
    label: "Beta",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
};

function getBarColor(value: number): string {
  if (value === 0) return "bg-zinc-600";
  if (value <= 25) return "bg-red-400";
  if (value <= 50) return "bg-amber-400";
  if (value <= 75) return "bg-[var(--primary)]";
  return "bg-emerald-400";
}

interface FeatureCardProps {
  feature: FeatureItem;
  index: number;
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = iconMap[feature.icon] || CircleDot;
  const status = statusConfig[feature.status];

  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className={cn(
        "group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm",
        "transition-all duration-200 hover:shadow-lg hover:border-[var(--primary)]/30",
        "animate-slide-up opacity-0",
        "fill-mode-forwards"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary)]/10 shrink-0">
            <Icon className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[var(--foreground)] text-sm leading-tight">
              {feature.name}
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">
              {feature.description}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full font-medium border border-transparent",
            status.bg,
            status.text
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4 mb-4">
        <ProgressRing value={feature.completion} size={52} strokeWidth={3.5} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
              Prod Readiness
            </span>
            <span className="text-[11px] font-semibold tabular-nums text-[var(--foreground)]">
              {feature.completion}%
            </span>
          </div>
          {/* progress bar */}
          <div className="h-1.5 w-full rounded-full bg-[var(--muted)]/50 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                getBarColor(feature.completion)
              )}
              style={{ width: `${feature.completion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Items */}
      {feature.statusItems.length > 0 && (
        <ul className="space-y-1.5 mb-4">
          {feature.statusItems.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-[var(--muted-foreground)]"
            >
              <span className="text-[var(--primary)] mt-0.5 shrink-0 leading-none">
                &#8226;
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state for not-started */}
      {feature.statusItems.length === 0 && (
        <div className="mb-4 py-3 px-3 rounded-lg bg-[var(--muted)]/20 text-center">
          <p className="text-xs text-[var(--muted-foreground)]/60 italic">
            Planned &#8212; development not yet started
          </p>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
        {feature.tags.slice(0, 5).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--muted)]/40 text-[var(--muted-foreground)]"
          >
            {tag}
          </span>
        ))}
        {feature.tags.length > 5 && (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--muted)]/40 text-[var(--muted-foreground)]">
            +{feature.tags.length - 5}
          </span>
        )}
      </div>
    </div>
  );
}
