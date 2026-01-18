---
title: Hooks
description: API reference for LocalFlag React hooks.
---

## useFeatureFlag

Returns `true` if a flag is enabled (truthy), `false` otherwise.

```tsx
import { useFeatureFlag } from '@localflag/react';

function MyComponent() {
  const isEnabled = useFeatureFlag<AppFlags>('darkMode');
  // isEnabled: boolean
}
```

## useFeatureFlagValue

Returns the raw value of a feature flag.

```tsx
import { useFeatureFlagValue } from '@localflag/react';

function MyComponent() {
  const maxItems = useFeatureFlagValue<AppFlags>('maxItems');
  // maxItems: number (based on your flag definition)
}
```

## useFeatureFlags

Returns all feature flags as an object.

```tsx
import { useFeatureFlags } from '@localflag/react';

function MyComponent() {
  const flags = useFeatureFlags<AppFlags>();
  // flags: { darkMode: boolean, maxItems: number, ... }
}
```

## useFeatureFlagControls

Returns functions to programmatically control flags.

```tsx
import { useFeatureFlagControls } from '@localflag/react';

function AdminPanel() {
  const { setFlag, resetFlags } = useFeatureFlagControls<AppFlags>();

  return (
    <>
      <button onClick={() => setFlag('darkMode', true)}>
        Enable Dark Mode
      </button>
      <button onClick={() => resetFlags()}>
        Reset All Flags
      </button>
    </>
  );
}
```

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `setFlag` | `(flagName, value) => void` | Set a specific flag value |
| `resetFlags` | `() => void` | Reset all flags to defaults |

## useFeatureFlagContext

Returns the full context value. Use this when you need access to everything.

```tsx
import { useFeatureFlagContext } from '@localflag/react';

function MyComponent() {
  const { flags, isEnabled, getValue, setFlag, resetFlags } =
    useFeatureFlagContext<AppFlags>();
}
```

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `flags` | `T` | All current flag values |
| `isEnabled` | `(flagName) => boolean` | Check if flag is truthy |
| `getValue` | `(flagName) => T[K]` | Get raw flag value |
| `setFlag` | `(flagName, value) => void` | Set a flag value |
| `resetFlags` | `() => void` | Reset all flags |
