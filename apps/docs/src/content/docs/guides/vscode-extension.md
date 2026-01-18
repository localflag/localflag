---
title: VS Code Extension
description: Use the LocalFlag VS Code extension to view and toggle feature flags directly in your editor.
---

The LocalFlag VS Code extension provides a sidebar view to see all your feature flags and toggle boolean flags with a single click.

## Installation

Install from one of the marketplaces:

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=localflag.localflag-vscode)
- [Open VSX](https://open-vsx.org/extension/localflag/localflag-vscode) (for VSCodium, Gitpod, etc.)

Or build locally:

```bash
cd apps/vscode-extension
pnpm install
pnpm build
```

Then press `F5` in VS Code to launch the Extension Development Host.

## Features

### Sidebar View

The extension adds a LocalFlag icon to your activity bar. Click it to see all detected feature flags organized by file:

```
LocalFlag
├── src/flags.ts
│   ├── darkMode: false (boolean)
│   ├── newHeader: true (boolean)
│   └── maxItems: 10 (number)
└── config/flags.config.ts
    └── ...
```

### Quick Toggle for Boolean Flags

Boolean flags show a toggle icon on the right side. Click it to:

1. Toggle the value (`true` ↔ `false`) directly in the source file
2. Automatically save the file
3. Update the sidebar to reflect the new value

### Go to Definition

Click any flag name to jump directly to its definition in the source file.

### IntelliSense

Get autocomplete suggestions for flag names when using LocalFlag hooks and components:

```tsx
// Type the opening quote and see all available flags
useFeatureFlag<AppFlags>('|')
useFeatureFlagValue<AppFlags>('|')
<FeatureFlag<AppFlags> flag="|" />
```

### Automatic Refresh

The sidebar automatically updates when you:
- Save a flag file
- Create or delete flag files
- Change extension settings

## Detected Patterns

The extension recognizes these flag definition patterns:

### `as const` Pattern

```ts
export const defaultFlags = {
  darkMode: false,
  maxItems: 10,
} as const;
```

### `defineFlags()` Helper

```ts
export const flags = defineFlags({
  darkMode: false,
});
```

### `createFlags()` with Descriptions

```ts
export const { flags, descriptions } = createFlags({
  darkMode: { value: false, description: "Enable dark theme" },
});
```

## Configuration

### Flag File Patterns

Configure which files to scan for flags in your VS Code settings:

```json
{
  "localflag.flagFilePatterns": [
    "**/flags.ts",
    "**/flags.config.ts",
    "**/*.flags.ts"
  ]
}
```

## Commands

| Command | Description |
|---------|-------------|
| `LocalFlag: Refresh Flags` | Manually refresh the flag list |
| `LocalFlag: Toggle Flag` | Toggle a boolean flag (also available via inline icon) |
| `LocalFlag: Go to Flag Definition` | Jump to the flag's source location |

## Keyboard Shortcuts

Use the refresh button in the sidebar title bar to manually refresh flags after external changes.
