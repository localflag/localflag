# LocalFlag for VS Code

View and toggle your feature flags directly in VS Code.

![LocalFlag VS Code Extension](https://raw.githubusercontent.com/localflag/localflag/main/apps/vscode-extension/media/screenshot.png)

## Features

### Sidebar View

See all your feature flags organized by file in the LocalFlag sidebar panel.

### Quick Toggle

Toggle boolean flags with a single click - changes are applied directly to your source file.

### Go to Definition

Click any flag to jump directly to its definition.

### IntelliSense

Get autocomplete suggestions for flag names when using LocalFlag hooks and components:

```tsx
useFeatureFlag<AppFlags>('darkMode')  // autocomplete works here
```

## Detected Patterns

The extension recognizes these flag definition patterns:

```ts
// as const pattern
export const flags = {
  darkMode: false,
} as const;

// defineFlags helper
export const flags = defineFlags({
  darkMode: false,
});

// createFlags with descriptions
export const { flags } = createFlags({
  darkMode: { value: false, description: "Enable dark theme" },
});
```

## Configuration

### Flag File Patterns

Configure which files to scan in VS Code settings:

```json
{
  "localflag.flagFilePatterns": [
    "**/flags.ts",
    "**/flags.config.ts",
    "**/*.flags.ts"
  ]
}
```

## Links

- [Documentation](https://docs.localflag.io/guides/vscode-extension)
- [GitHub](https://github.com/localflag/localflag)
- [npm Package](https://www.npmjs.com/package/@localflag/react)

## License

MIT
