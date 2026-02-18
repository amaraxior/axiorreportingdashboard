export type FeatureStatus = "not-started" | "in-progress" | "beta" | "completed";

export type FeatureCategory =
  | "generation"
  | "marketplace"
  | "routing"
  | "registry"
  | "context"
  | "grading"
  | "infrastructure";

export type FeaturePriority = "low" | "medium" | "high" | "critical";

export interface FeatureItem {
  id: number;
  name: string;
  shortName: string;
  description: string;
  category: FeatureCategory;
  status: FeatureStatus;
  completion: number;
  statusItems: string[];
  tags: string[];
  priority: FeaturePriority;
  icon: string;
}

export interface FeaturesRoadmapData {
  pageTitle: string;
  pageDescription: string;
  lastUpdated: string;
  features: FeatureItem[];
}
