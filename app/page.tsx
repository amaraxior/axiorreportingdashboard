"use client";

import { useState, useMemo } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  Map,
  Rocket,
  CheckCircle2,
  Clock,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { FeatureCard } from "@/components/ui/feature-card";
import roadmapData from "@/data/features-roadmap.json";
import type { FeaturesRoadmapData, FeatureCategory } from "@/data/types";

const data = roadmapData as FeaturesRoadmapData;

type FilterValue = FeatureCategory | "all";

const categories: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Generation", value: "generation" },
  { label: "Context", value: "context" },
  { label: "Grading", value: "grading" },
  { label: "Marketplace", value: "marketplace" },
  { label: "Infrastructure", value: "infrastructure" },
  { label: "Routing", value: "routing" },
  { label: "Registry", value: "registry" },
];

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState<FilterValue>("all");

  const filteredFeatures = useMemo(() => {
    if (activeCategory === "all") return data.features;
    return data.features.filter((f) => f.category === activeCategory);
  }, [activeCategory]);

  const stats = useMemo(() => {
    const features = data.features;
    const total = features.length;
    const inProgress = features.filter(
      (f) => f.status === "in-progress"
    ).length;
    const completed = features.filter(
      (f) => f.status === "completed"
    ).length;
    const notStarted = features.filter(
      (f) => f.status === "not-started"
    ).length;
    const avgCompletion = Math.round(
      features.reduce((sum, f) => sum + f.completion, 0) / total
    );
    return { total, inProgress, completed, notStarted, avgCompletion };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/axiorlogo.svg"
              alt="Axior"
              className="h-7 w-auto opacity-90"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--muted-foreground)]/60 hidden sm:block">
              Project Dashboard
            </span>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] rounded-lg hover:opacity-90 transition-opacity">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Auth Gate - Show sign-in prompt for unauthenticated users */}
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary)]/10 mb-6">
              <Map className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[var(--foreground)] mb-3 tracking-tight">
              Features &amp; Roadmap
            </h1>
            <p className="text-[var(--muted-foreground)] mb-8 text-sm">
              Sign in to view the Axior platform development roadmap and feature progress.
            </p>
            <SignInButton mode="modal">
              <button className="px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[var(--primary)]/20">
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      {/* Dashboard content - only visible when signed in */}
      <SignedIn>

      <main className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary)]/10 mb-5">
            <Map className="w-7 h-7 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--foreground)] mb-3 tracking-tight">
            {data.pageTitle}
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-lg mx-auto text-sm md:text-base">
            {data.pageDescription}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]/50 mt-2">
            Last updated:{" "}
            {new Date(data.lastUpdated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-10 animate-fade-in">
          <StatCard
            icon={<Rocket className="w-4 h-4 text-[var(--primary)]" />}
            label="Total Modules"
            value={stats.total}
          />
          <StatCard
            icon={<Clock className="w-4 h-4 text-amber-400" />}
            label="In Progress"
            value={stats.inProgress}
          />
          <StatCard
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            label="Completed"
            value={stats.completed}
          />
          <StatCard
            icon={<AlertCircle className="w-4 h-4 text-zinc-400" />}
            label="Not Started"
            value={stats.notStarted}
          />
          {/* <StatCard
            icon={<BarChart3 className="w-4 h-4 text-blue-400" />}
            label="Avg. Completion"
            value={`${stats.avgCompletion}%`}
            className="col-span-2 lg:col-span-1"
          /> */}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.value;
            const count =
              cat.value === "all"
                ? data.features.length
                : data.features.filter((f) => f.category === cat.value).length;

            if (cat.value !== "all" && count === 0) return null;

            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                    : "bg-[var(--muted)]/40 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                {cat.label}
                <span
                  className={cn(
                    "text-[10px] min-w-[18px] text-center px-1 py-0.5 rounded-full font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--background)]/50 text-[var(--muted-foreground)]"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredFeatures.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {/* Empty state */}
        {filteredFeatures.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--muted)]/30 mb-4">
              <Map className="w-6 h-6 text-[var(--muted-foreground)]/40" />
            </div>
            <p className="text-[var(--muted-foreground)]">
              No features in this category yet.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-14 p-5 rounded-2xl bg-gradient-to-br from-[var(--primary)]/5 to-transparent border border-[var(--primary)]/10 text-center">
          <p className="text-xs text-[var(--muted-foreground)]">
            {/* This roadmap is continuously updated as development progresses.
            Completion percentages reflect progress towards production
            acceptance. */}
          </p>

        </footer>
      </main>
      </SignedIn>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl border border-[var(--border)]/60 bg-[var(--card)]",
        className
      )}
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--muted)]/30">
        {icon}
      </div>
      <div>
        <p className="text-xl font-semibold tabular-nums text-[var(--foreground)]">
          {value}
        </p>
        <p className="text-[11px] text-[var(--muted-foreground)]">{label}</p>
      </div>
    </div>
  );
}
