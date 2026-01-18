---
title: FeatureFlagProvider
description: API reference for the FeatureFlagProvider component.
---

The `FeatureFlagProvider` component provides feature flag context to your application.

## Import

```tsx
import { FeatureFlagProvider } from '@localflag/react';
```

## Props

### `defaultFlags` (required)

The default values for all feature flags.

```tsx
type FeatureFlags = Record<string, boolean | string | number>;
```

### `storageKey`

Key used for localStorage persistence.

- Type: `string`
- Default: `"localflag:overrides"`

```tsx
<FeatureFlagProvider
  defaultFlags={flags}
  storageKey="my-app:flags"
>
```

### `persistOverrides`

Whether to persist flag overrides to localStorage.

- Type: `boolean`
- Default: `true`

```tsx
<FeatureFlagProvider
  defaultFlags={flags}
  persistOverrides={false}
>
```

## Example

```tsx
const defaultFlags = {
  darkMode: false,
  betaFeatures: true,
  maxResults: 50,
} as const;

type AppFlags = typeof defaultFlags;

function App() {
  return (
    <FeatureFlagProvider defaultFlags={defaultFlags}>
      <MyApp />
    </FeatureFlagProvider>
  );
}
```

## TypeScript

For full type safety, define your flags with `as const` and create a type alias:

```tsx
export const defaultFlags = {
  darkMode: false,
  newUI: true,
} as const;

export type AppFlags = typeof defaultFlags;
```

Then use generics when accessing flags:

```tsx
const darkMode = useFeatureFlag<AppFlags>('darkMode');
```
