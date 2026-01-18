import { useMemo } from "react";
import { useFeatureFlagContext } from "./context";
import type { FeatureFlags } from "./types";

/**
 * Hook to check if a feature flag is enabled (truthy)
 */
export function useFeatureFlag<T extends FeatureFlags = FeatureFlags>(
  flagName: keyof T
): boolean {
  const { isEnabled } = useFeatureFlagContext<T>();
  return isEnabled(flagName);
}

/**
 * Hook to get the raw value of a feature flag
 */
export function useFeatureFlagValue<
  T extends FeatureFlags = FeatureFlags,
  K extends keyof T = keyof T
>(flagName: K): T[K] {
  const { getValue } = useFeatureFlagContext<T>();
  return getValue(flagName);
}

/**
 * Hook to get all feature flags
 */
export function useFeatureFlags<T extends FeatureFlags = FeatureFlags>(): T {
  const { flags } = useFeatureFlagContext<T>();
  return flags;
}

/**
 * Hook to get flag controls (setFlag, resetFlags)
 */
export function useFeatureFlagControls<T extends FeatureFlags = FeatureFlags>() {
  const { setFlag, resetFlags } = useFeatureFlagContext<T>();
  return useMemo(() => ({ setFlag, resetFlags }), [setFlag, resetFlags]);
}

/**
 * Component wrapper that renders children only if flag is enabled
 */
export function FeatureFlag<T extends FeatureFlags = FeatureFlags>({
  flag,
  children,
  fallback = null,
}: {
  flag: keyof T;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactNode {
  const enabled = useFeatureFlag<T>(flag);
  return enabled ? children : fallback;
}
