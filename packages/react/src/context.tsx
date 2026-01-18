import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type {
  FeatureFlagContextValue,
  FeatureFlagProviderProps,
  FeatureFlags,
} from "./types";

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

const STORAGE_KEY_DEFAULT = "localflag:overrides";

function getStoredOverrides<T extends FeatureFlags>(
  storageKey: string
): Partial<T> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setStoredOverrides<T extends FeatureFlags>(
  storageKey: string,
  overrides: Partial<T>
): void {
  if (typeof window === "undefined") return;
  try {
    if (Object.keys(overrides).length === 0) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(overrides));
    }
  } catch {
    // Ignore storage errors
  }
}

// Event emitter for devtools communication
type Listener = () => void;
const listeners = new Set<Listener>();
let currentState: {
  flags: FeatureFlags;
  defaultFlags: FeatureFlags;
  descriptions: Record<string, string>;
} | null = null;

export function subscribeToFlagChanges(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFlagState() {
  return currentState;
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function FeatureFlagProvider<T extends FeatureFlags>({
  children,
  defaultFlags,
  descriptions = {},
  storageKey = STORAGE_KEY_DEFAULT,
  persistOverrides = true,
}: FeatureFlagProviderProps<T>) {
  const [overrides, setOverrides] = useState<Partial<T>>(() =>
    persistOverrides ? getStoredOverrides<T>(storageKey) : {}
  );

  const flags = useMemo(
    () => ({ ...defaultFlags, ...overrides }) as T,
    [defaultFlags, overrides]
  );

  // Update global state for devtools
  useEffect(() => {
    currentState = {
      flags,
      defaultFlags,
      descriptions: descriptions as Record<string, string>,
    };
    notifyListeners();
  }, [flags, defaultFlags, descriptions]);

  // Persist overrides to localStorage
  useEffect(() => {
    if (persistOverrides) {
      setStoredOverrides(storageKey, overrides);
    }
  }, [overrides, storageKey, persistOverrides]);

  const isEnabled = useCallback(
    (flagName: keyof T): boolean => {
      const value = flags[flagName];
      return Boolean(value);
    },
    [flags]
  );

  const getValue = useCallback(
    <K extends keyof T>(flagName: K): T[K] => {
      return flags[flagName];
    },
    [flags]
  );

  const setFlag = useCallback(<K extends keyof T>(flagName: K, value: T[K]) => {
    setOverrides((prev) => ({ ...prev, [flagName]: value }));
  }, []);

  const resetFlags = useCallback(() => {
    setOverrides({});
  }, []);

  const value = useMemo<FeatureFlagContextValue<T>>(
    () => ({
      flags,
      isEnabled,
      getValue,
      setFlag,
      resetFlags,
    }),
    [flags, isEnabled, getValue, setFlag, resetFlags]
  );

  return (
    <FeatureFlagContext.Provider value={value as unknown as FeatureFlagContextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlagContext<
  T extends FeatureFlags = FeatureFlags
>(): FeatureFlagContextValue<T> {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error(
      "useFeatureFlagContext must be used within a FeatureFlagProvider"
    );
  }
  return context as unknown as FeatureFlagContextValue<T>;
}

// Hook for devtools to subscribe to flag changes
export function useFlagState() {
  return useSyncExternalStore(
    subscribeToFlagChanges,
    getFlagState,
    () => null
  );
}
