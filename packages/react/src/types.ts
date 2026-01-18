export type FlagValue = boolean | string | number;

export interface FeatureFlags {
  [key: string]: FlagValue;
}

export interface FeatureFlagContextValue<T extends FeatureFlags = FeatureFlags> {
  flags: T;
  isEnabled: (flagName: keyof T) => boolean;
  getValue: <K extends keyof T>(flagName: K) => T[K];
  setFlag: <K extends keyof T>(flagName: K, value: T[K]) => void;
  resetFlags: () => void;
}

export interface FeatureFlagProviderProps<T extends FeatureFlags = FeatureFlags> {
  children: React.ReactNode;
  defaultFlags: T;
  storageKey?: string;
  persistOverrides?: boolean;
}
