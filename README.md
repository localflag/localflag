# LocalFlag

Type-safe feature flags for React with built-in DevTools.

## Packages

| Package | Description |
|---------|-------------|
| [@localflag/react](./packages/react) | React hooks and components for feature flags |

## Features

- **Type-Safe** - Full TypeScript support with generics and autocomplete
- **DevTools** - Built-in floating panel to toggle flags in real-time
- **Persistent** - Overrides saved to localStorage across sessions
- **Zero Config** - Works out of the box with sensible defaults

## Quick Start

```bash
npm install @localflag/react
```

```tsx
import { FeatureFlagProvider, useFeatureFlag, DevTools } from '@localflag/react';

const flags = {
  darkMode: false,
  newFeature: true,
} as const;

function App() {
  return (
    <FeatureFlagProvider defaultFlags={flags}>
      <MyApp />
      <DevTools />
    </FeatureFlagProvider>
  );
}

function MyComponent() {
  const isDark = useFeatureFlag('darkMode');
  return <div className={isDark ? 'dark' : 'light'}>...</div>;
}
```

## Development

This is a monorepo managed with [pnpm](https://pnpm.io/) and [Turborepo](https://turborepo.dev/).

### Setup

```bash
pnpm install
```

### Commands

```bash
# Build all packages
pnpm build

# Start development servers
pnpm dev

# Run type checking
pnpm check-types

# Lint code
pnpm lint
```

### Apps

| App | Description | Port |
|-----|-------------|------|
| [demo](./apps/demo) | Demo application | 3000 |
| [docs](./apps/docs) | Documentation site | 4321 |
| [landingpage](./apps/landingpage) | Landing page | 4001 |

## License

MIT
