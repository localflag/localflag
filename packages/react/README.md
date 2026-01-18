# @localflag/react

Type-safe feature flags for React with built-in LocalFlagDevTools.

[Website](https://localflag.io) · [Documentation](https://docs.localflag.io) · [Demo](https://demo.localflag.io) · [GitHub](https://github.com/localflag/localflag)

## Installation

```bash
npm install @localflag/react
```

## Quick Start

```tsx
import { FeatureFlagProvider, useFeatureFlag, LocalFlagDevTools } from '@localflag/react';

// 1. Define your flags
const defaultFlags = {
  darkMode: false,
  newCheckout: true,
  maxItems: 10,
} as const;

// 2. Create a type for your flags
type AppFlags = typeof defaultFlags;

// 3. Wrap your app with the provider
function App() {
  return (
    <FeatureFlagProvider<AppFlags> defaultFlags={defaultFlags}>
      <MyApp />
      <LocalFlagDevTools /> {/* Optional: adds a floating panel to toggle flags */}
    </FeatureFlagProvider>
  );
}

// 4. Use flags in your components
function MyComponent() {
  const isDarkMode = useFeatureFlag<AppFlags>('darkMode');

  return <div className={isDarkMode ? 'dark' : 'light'}>...</div>;
}
```

## API

### `FeatureFlagProvider`

The context provider that makes feature flags available to your app.

```tsx
<FeatureFlagProvider<AppFlags>
  defaultFlags={defaultFlags}
  storageKey="my-app-flags"    // Optional: localStorage key (default: 'feature-flags')
  persistOverrides={true}       // Optional: persist overrides to localStorage (default: true)
>
  {children}
</FeatureFlagProvider>
```

### Hooks

#### `useFeatureFlag<T>(flagName)`

Returns `true` if the flag is enabled (truthy), `false` otherwise.

```tsx
const isEnabled = useFeatureFlag<AppFlags>('darkMode');
// Returns: boolean
```

#### `useFeatureFlagValue<T>(flagName)`

Returns the actual value of the flag.

```tsx
const maxItems = useFeatureFlagValue<AppFlags>('maxItems');
// Returns: 10 (the actual value)
```

#### `useFeatureFlags<T>()`

Returns all current flag values.

```tsx
const flags = useFeatureFlags<AppFlags>();
// Returns: { darkMode: false, newCheckout: true, maxItems: 10 }
```

#### `useFeatureFlagControls<T>()`

Returns functions to control flags programmatically.

```tsx
const { setFlag, resetFlags } = useFeatureFlagControls<AppFlags>();

// Set a specific flag
setFlag('darkMode', true);

// Reset all flags to defaults
resetFlags();
```

### Components

#### `FeatureFlag`

Conditionally render content based on a flag.

```tsx
import { FeatureFlag } from '@localflag/react';

<FeatureFlag<AppFlags> flag="newCheckout">
  <NewCheckoutFlow />
</FeatureFlag>

// With fallback
<FeatureFlag<AppFlags> flag="newCheckout" fallback={<OldCheckout />}>
  <NewCheckoutFlow />
</FeatureFlag>
```

#### `LocalFlagDevTools`

A floating panel for toggling flags during development.

```tsx
import { LocalFlagDevTools } from '@localflag/react';

<LocalFlagDevTools
  position="bottom-right"  // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  defaultOpen={false}      // Start expanded or collapsed
/>
```

## TypeScript

The library is fully typed. Define your flags with `as const` to get full type inference:

```tsx
const defaultFlags = {
  darkMode: false,
  newFeature: true,
  apiVersion: 'v2',
  maxRetries: 3,
} as const;

type AppFlags = typeof defaultFlags;

// Now all hooks will autocomplete flag names and infer value types
const version = useFeatureFlagValue<AppFlags>('apiVersion');
// TypeScript knows this is 'v2' (string literal type)
```

### Config File Pattern

For larger projects, you can use `defineFlags` to create a centralized config file:

```ts
// flags.config.ts
import { defineFlags } from '@localflag/react';

export const flags = defineFlags({
  darkMode: false,
  newCheckout: true,
  maxRetries: 3,
});

export type AppFlags = typeof flags;
```

Then import it in your app:

```tsx
// App.tsx
import { flags, AppFlags } from './flags.config';
import { FeatureFlagProvider, useFeatureFlag } from '@localflag/react';

function App() {
  return (
    <FeatureFlagProvider<AppFlags> defaultFlags={flags}>
      <MyApp />
    </FeatureFlagProvider>
  );
}
```

Benefits:
- All flags managed in one place
- Easy to export and share types across your app
- Enables future tooling integration

## Persistence

By default, flag overrides are persisted to `localStorage`. This means:

- Flags you toggle in LocalFlagDevTools persist across page reloads
- Each user can have their own overrides for testing
- Call `resetFlags()` to clear all overrides and return to defaults

To disable persistence:

```tsx
<FeatureFlagProvider defaultFlags={defaultFlags} persistOverrides={false}>
```

## License

MIT
