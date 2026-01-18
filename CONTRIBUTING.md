# Contributing to LocalFlag

Thank you for your interest in contributing to LocalFlag! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/localflag/localflag.git
cd localflag

# Install dependencies
pnpm install

# Start development
pnpm dev
```

## Project Structure

```
localflag/
├── packages/
│   └── react/          # @localflag/react npm package
├── apps/
│   ├── demo/           # Demo application
│   ├── docs/           # Documentation site
│   ├── landingpage/    # Landing page
│   └── vscode-extension/ # VS Code extension
```

## Development Workflow

### Running Locally

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm dev --filter demo
pnpm dev --filter docs

# Build all packages
pnpm build

# Type checking
pnpm check-types

# Linting
pnpm lint

# Format code
pnpm format
```

### Making Changes

1. Create a new branch from `main`
2. Make your changes
3. Run `pnpm check-types` and `pnpm lint`
4. Commit with a descriptive message
5. Open a Pull Request

## Commit Messages

We use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `refactor:` Code refactoring
- `test:` Adding or updating tests

Examples:
```
feat: add flag descriptions support
fix: resolve toggle state persistence issue
docs: update DevTools documentation
```

## Pull Requests

- Keep PRs focused on a single change
- Update documentation if needed
- Add tests for new features
- Ensure all checks pass

## Code Style

- Use TypeScript
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic

## Testing

```bash
# Run tests (when available)
pnpm test
```

## Questions?

- Open a [Discussion](https://github.com/localflag/localflag/discussions)
- Check existing [Issues](https://github.com/localflag/localflag/issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
