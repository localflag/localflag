---
title: LocalFlagDevTools
description: Use the built-in LocalFlagDevTools panel to manage feature flags during development.
---

The LocalFlagDevTools component provides a floating panel that allows you to toggle feature flags without changing code.

## Adding LocalFlagDevTools

Include the `LocalFlagDevTools` component inside your `FeatureFlagProvider`:

```tsx
import { FeatureFlagProvider, LocalFlagDevTools } from '@localflag/react';
import { defaultFlags } from './flags';

function App() {
  return (
    <FeatureFlagProvider defaultFlags={defaultFlags}>
      <YourApp />
      <LocalFlagDevTools />
    </FeatureFlagProvider>
  );
}
```

## Features

### Flags Tab

#### Toggle Boolean Flags

Boolean flags display as toggle switches. Click to enable or disable.

#### Edit String/Number Values

String and number flags show an input field where you can change the value.

#### Override Indicator

Flags that have been changed from their default values are marked with a blue dot.

#### Reset All

A "Reset overrides" button appears when any flags have been modified, allowing you to restore all default values.

### Options Tab

The Options tab allows you to configure the LocalFlagDevTools panel directly from the UI.

#### Position

Choose where the LocalFlagDevTools panel appears by selecting one of four positions:
- Top Left
- Top Right
- Bottom Left
- Bottom Right

The selected position is automatically saved and persists across page reloads.

### Persistent Storage

All overrides and settings are automatically saved to `localStorage`:
- Flag overrides: `localflag:overrides`
- Panel position: `localflag:position`

## Configuration

### Initial Position

Set the initial position via prop (can be changed later in the Options tab):

```tsx
<LocalFlagDevTools position="bottom-right" /> {/* default */}
<LocalFlagDevTools position="bottom-left" />
<LocalFlagDevTools position="top-right" />
<LocalFlagDevTools position="top-left" />
```

### Default Open State

Start with the panel expanded:

```tsx
<LocalFlagDevTools defaultOpen={true} />
```

## Production Behavior

LocalFlagDevTools automatically hides itself in production builds. You don't need to conditionally render it.
