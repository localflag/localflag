---
title: DevTools
description: Use the built-in DevTools panel to manage feature flags during development.
---

The DevTools component provides a floating panel that allows you to toggle feature flags without changing code.

## Adding DevTools

Include the `DevTools` component inside your `FeatureFlagProvider`:

```tsx
import { FeatureFlagProvider, DevTools } from '@localflag/react';
import { defaultFlags } from './flags';

function App() {
  return (
    <FeatureFlagProvider defaultFlags={defaultFlags}>
      <YourApp />
      <DevTools />
    </FeatureFlagProvider>
  );
}
```

## Features

### Toggle Boolean Flags

Boolean flags display as toggle switches. Click to enable or disable.

### Edit String/Number Values

String and number flags show an input field where you can change the value.

### Override Indicator

Flags that have been changed from their default values are marked with an "override" badge.

### Reset All

A "Reset all overrides" button appears when any flags have been modified, allowing you to restore all default values.

### Persistent Storage

All overrides are automatically saved to `localStorage` and persist across page reloads and browser sessions.

## Configuration

### Position

Choose where the DevTools panel appears:

```tsx
<DevTools position="bottom-right" /> {/* default */}
<DevTools position="bottom-left" />
<DevTools position="top-right" />
<DevTools position="top-left" />
```

### Default Open State

Start with the panel expanded:

```tsx
<DevTools defaultOpen={true} />
```

## Production Behavior

DevTools automatically hides itself in production builds. You don't need to conditionally render it.
