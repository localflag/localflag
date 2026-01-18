---
title: Components
description: API reference for LocalFlag React components.
---

## FeatureFlag

A component that conditionally renders its children based on a feature flag.

```tsx
import { FeatureFlag } from '@localflag/react';

function MyComponent() {
  return (
    <FeatureFlag<AppFlags> flag="newFeature">
      <NewFeatureComponent />
    </FeatureFlag>
  );
}
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `flag` | `keyof T` | The name of the feature flag to check |
| `children` | `ReactNode` | Content to render when flag is enabled |
| `fallback` | `ReactNode` | Optional content to render when flag is disabled |

### With Fallback

```tsx
<FeatureFlag<AppFlags> flag="newDashboard" fallback={<OldDashboard />}>
  <NewDashboard />
</FeatureFlag>
```

## DevTools

A floating panel for managing feature flags during development.

```tsx
import { DevTools } from '@localflag/react';

function App() {
  return (
    <FeatureFlagProvider defaultFlags={defaultFlags}>
      <MyApp />
      <DevTools />
    </FeatureFlagProvider>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left"` | `"bottom-right"` | Panel position |
| `defaultOpen` | `boolean` | `false` | Whether panel starts expanded |

### Example

```tsx
<DevTools position="top-left" defaultOpen={true} />
```
