---
title: Getting Started
description: Learn how to set up LocalFlag in your React application.
---

## Installation

Install the package using your preferred package manager:

```bash
npm install @localflag/react
# or
pnpm add @localflag/react
# or
yarn add @localflag/react
```

## Define Your Flags

Create a file to define your feature flags with their default values. Use the `defineFlags` helper for type safety:

```ts
// src/flags.ts
import { defineFlags } from '@localflag/react';

export const defaultFlags = defineFlags({
  darkMode: false,
  newDashboard: true,
  experimentalFeature: false,
  maxItems: 10,
  apiVersion: "v1",
});

export type AppFlags = typeof defaultFlags;
```

The `defineFlags` function is a type-safe helper that ensures your flags have valid values (`boolean`, `string`, or `number`). It has no runtime overhead—it simply returns your flags object as-is.

:::tip[Alternative: as const]
You can also use TypeScript's `as const` assertion instead of `defineFlags`:

```ts
export const defaultFlags = {
  darkMode: false,
  // ...
} as const;
```

Both approaches work equally well. `defineFlags` provides type validation, while `as const` is dependency-free.
:::

## Set Up the Provider

Wrap your application with the `FeatureFlagProvider`:

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FeatureFlagProvider, LocalFlagDevTools } from '@localflag/react';
import { defaultFlags } from './flags';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FeatureFlagProvider defaultFlags={defaultFlags}>
      <App />
      <LocalFlagDevTools />
    </FeatureFlagProvider>
  </StrictMode>
);
```

## Use Feature Flags

Now you can use feature flags anywhere in your app:

```tsx
import { useFeatureFlag, useFeatureFlagValue, FeatureFlag } from '@localflag/react';
import type { AppFlags } from './flags';

function MyComponent() {
  // Check if a flag is enabled (boolean)
  const darkMode = useFeatureFlag<AppFlags>('darkMode');

  // Get the raw value of a flag
  const maxItems = useFeatureFlagValue<AppFlags>('maxItems');

  return (
    <div className={darkMode ? 'dark' : 'light'}>
      <p>Showing up to {maxItems} items</p>

      {/* Conditional rendering with FeatureFlag component */}
      <FeatureFlag<AppFlags> flag="newDashboard">
        <NewDashboard />
      </FeatureFlag>
    </div>
  );
}
```

## Next Steps

- Learn about the [LocalFlagDevTools](/guides/devtools/) for local development
- Try the [VS Code Extension](/guides/vscode-extension/) to manage flags in your editor
- Explore the [API Reference](/reference/provider/) for all available options
