import type { FlagValue } from "./types";

/**
 * Helper function to define feature flags with type safety.
 * This is a type-only helper with no runtime logic - it simply returns the flags as-is.
 *
 * @example
 * ```ts
 * // flags.config.ts
 * import { defineFlags } from '@localflag/react';
 *
 * export const flags = defineFlags({
 *   darkMode: false,
 *   newCheckout: true,
 *   maxRetries: 3,
 * });
 *
 * export type AppFlags = typeof flags;
 * ```
 */
export function defineFlags<T extends Record<string, FlagValue>>(flags: T): T {
  return flags;
}

/**
 * Flag configuration with value and optional description.
 */
export interface FlagConfig<T extends FlagValue = FlagValue> {
  value: T;
  description?: string;
}

type FlagInput<T extends FlagValue = FlagValue> = T | FlagConfig<T>;

type ExtractFlagValue<T> = T extends FlagConfig<infer V> ? V : T;

type ExtractFlags<T extends Record<string, FlagInput>> = {
  [K in keyof T]: ExtractFlagValue<T[K]>;
};

/**
 * Helper function to define feature flags with descriptions.
 * Returns both the flags object and a descriptions object.
 *
 * @example
 * ```ts
 * // flags.config.ts
 * import { createFlags } from '@localflag/react';
 *
 * export const { flags, descriptions } = createFlags({
 *   darkMode: { value: false, description: "Enable dark theme" },
 *   newCheckout: { value: true, description: "Use new checkout flow" },
 *   maxRetries: 3, // Simple value without description
 * });
 *
 * export type AppFlags = typeof flags;
 * ```
 */
export function createFlags<T extends Record<string, FlagInput>>(
  config: T
): {
  flags: ExtractFlags<T>;
  descriptions: Partial<Record<keyof T, string>>;
} {
  const flags = {} as Record<string, FlagValue>;
  const descriptions = {} as Record<string, string>;

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === "object" && value !== null && "value" in value) {
      flags[key] = value.value;
      if (value.description) {
        descriptions[key] = value.description;
      }
    } else {
      flags[key] = value as FlagValue;
    }
  }

  return {
    flags: flags as ExtractFlags<T>,
    descriptions: descriptions as Partial<Record<keyof T, string>>,
  };
}
