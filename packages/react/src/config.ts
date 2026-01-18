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
