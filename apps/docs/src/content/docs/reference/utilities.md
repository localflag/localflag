---
title: Utilities
description: API reference for LocalFlag utility functions.
---

## defineFlags

A type-safe helper function for defining feature flags. It validates that all flag values are of valid types (`boolean`, `string`, or `number`) at the type level.

```ts
import { defineFlags } from '@localflag/react';

export const defaultFlags = defineFlags({
  darkMode: false,
  newDashboard: true,
  maxItems: 10,
  apiVersion: "v1",
});

export type AppFlags = typeof defaultFlags;
```

### Signature

```ts
function defineFlags<T extends Record<string, FlagValue>>(flags: T): T
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `flags` | `Record<string, FlagValue>` | An object containing flag names and their default values |

### Returns

Returns the same flags object unchanged. This function has no runtime overhead—it exists purely for type safety.

### Type Constraint

The `FlagValue` type accepts:
- `boolean` - For on/off flags
- `string` - For variant flags or configuration
- `number` - For numeric limits or thresholds

```ts
// Valid
defineFlags({
  enabled: true,        // boolean
  theme: "dark",        // string
  maxRetries: 3,        // number
});

// Type error: arrays and objects are not valid flag values
defineFlags({
  tags: ["a", "b"],     // Error: not a valid FlagValue
  config: { key: 1 },   // Error: not a valid FlagValue
});
```

### Why Use defineFlags?

1. **Type Validation** - Catches invalid flag types at compile time
2. **Consistency** - Establishes a clear pattern for flag definitions
3. **Future-Proof** - Enables potential tooling and CLI integrations

### Alternative: as const

If you prefer not to import `defineFlags`, you can use TypeScript's `as const` assertion:

```ts
export const defaultFlags = {
  darkMode: false,
  newDashboard: true,
} as const;

export type AppFlags = typeof defaultFlags;
```

Both approaches provide full type inference. The difference is that `defineFlags` validates flag value types, while `as const` allows any value type.
