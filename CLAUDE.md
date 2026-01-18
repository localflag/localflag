# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LocalFlag is a type-safe feature flag library for React with built-in DevTools. It's structured as a pnpm monorepo using Turborepo.

## Commands

```bash
# Development (all apps)
pnpm dev

# Build all packages
pnpm build

# Lint
pnpm lint

# Type check
pnpm check-types

# Format code
pnpm format

# Run specific app
pnpm dev --filter demo
pnpm dev --filter docs

# Build specific package
pnpm build --filter @localflag/react
```

## Architecture

### Monorepo Structure

- `packages/react` - The `@localflag/react` npm package (tsup build)
- `apps/demo` - Vite React demo app showcasing the library
- `apps/docs` - Astro Starlight documentation site

### @localflag/react Package

Core exports from `packages/react/src/index.ts`:

- **Provider**: `FeatureFlagProvider` - React context provider that wraps the app
- **Hooks**: `useFeatureFlag`, `useFeatureFlagValue`, `useFeatureFlags`, `useFeatureFlagControls`
- **Components**: `FeatureFlag` (conditional renderer), `DevTools` (floating debug panel)
- **Types**: `FeatureFlags`, `FlagValue`, `FeatureFlagContextValue`

Key implementation details:
- Flag overrides persist to localStorage (key: `localflag:overrides`)
- DevTools communicates with provider via `useSyncExternalStore` and a global state subscription
- DevTools must be inside the provider (same React context tree)

### Flag Types

Flags support `boolean | string | number` values. Define flags with `as const` for type safety:

```ts
const flags = { darkMode: false, maxItems: 10 } as const;
type AppFlags = typeof flags;
```
