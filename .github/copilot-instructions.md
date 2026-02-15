# Copilot Instructions for Limber/Glimdown

## Project Overview

**Glimdown** is an interactive browser-based REPL and tutorial platform for writing Ember/Glimmer applications using markdown syntax. This monorepo hosts:
- **Limber REPL** (https://limber.glimdown.com) - Interactive code editor for Glimmer components
- **Glimmer Tutorial** (https://tutorial.glimdown.com) - Interactive learning platform

The project enables users to write, test, and share Ember/Glimmer code directly in their browser without any setup.

## Tech Stack

- **Framework**: Ember.js v6+ (Octane edition), Glimmer components
- **Build System**: Vite (beta), Embroider, Turbo (monorepo orchestration)
- **Package Manager**: pnpm v10.25.0+ (required)
- **Node Version**: v24.12.0+ (enforced via Volta)
- **Languages**: TypeScript 5.9.3, JavaScript (ES2022+)
- **Testing**: Vitest (node), Testem (browser), QUnit
- **Linting**: ESLint (flat config), Prettier, ember-template-lint
- **Styling**: TailwindCSS
- **Syntax Parsing**: CodeMirror v6, Lezer parsers

## Repository Structure

```
limber/
├── apps/                   # Production applications
│   ├── repl/              # Main REPL application (Vite-based Ember)
│   ├── tutorial/          # Interactive tutorial application
│   └── home/              # Landing page
├── packages/              # Shared libraries and addons
│   ├── ember-repl/        # Core REPL addon
│   ├── repl-sdk/          # SDK for REPL functionality
│   ├── limber-ui/         # UI component library
│   ├── app-support/       # Styles and shared utilities
│   └── syntax/            # CodeMirror & Lezer syntax definitions
│       ├── glimmer/       # Base Glimmer syntax
│       ├── glimmer-ts/    # TypeScript variant
│       ├── glimdown/      # Markdown/Glimdown syntax
│       └── glimmer-js/    # JavaScript variant
├── dev/                   # Development tools (linting CLI)
├── patches/               # pnpm patch files for dependencies
└── .github/workflows/     # CI/CD pipelines
```

## Build & Development Commands

### Essential Commands

**Always run `pnpm i` after pulling changes or switching branches** to ensure dependencies are up to date.

```bash
pnpm i                     # Install all dependencies (required first step)
pnpm build                 # Build all apps and packages (uses Turbo caching)
pnpm start                 # Start all dev servers (REPL + Tutorial + styles)
pnpm lint                  # Run all linters (JS, HBS, Prettier, types)
pnpm lint:fix              # Auto-fix lint issues where possible
pnpm test                  # Run all tests (node + browser)
```

### App-Specific Commands

```bash
pnpm --filter=limber start        # Start REPL dev server (port 4201)
pnpm --filter=tutorial start      # Start tutorial dev server (port 4200)
pnpm --filter=limber-styles start # Watch and compile TailwindCSS
```

### Testing Commands

```bash
pnpm --filter=<package> test:node       # Run Vitest tests for package
pnpm --filter=<package> test:chrome     # Run browser tests in Chrome
pnpm --filter=<package> test:firefox    # Run browser tests in Firefox
```

### Build Order & Dependencies

1. Always build packages before apps (Turbo handles this automatically)
2. Syntax packages must be built before ember-repl
3. ember-repl and limber-ui must be built before the apps

## Linting & Code Quality

### Lint Checks (all must pass in CI)

```bash
pnpm lint         # Runs all lint tasks below
pnpm lint:fix     # Auto-fixes issues where possible
```

Individual lint tasks (via Turbo):
- `lint:js` - ESLint with flat config
- `lint:hbs` - Ember template linting
- `lint:prettier` - Code formatting (100 char line width, single quotes)
- `lint:types` - TypeScript type checking with Glint
- `lint:package` - Package.json validation
- `lint:published-types` - Validates published TypeScript declarations

### Code Style Guidelines

- **Line length**: 100 characters (Prettier enforced)
- **Quotes**: Single quotes preferred
- **Trailing commas**: Always use (es5 mode)
- **Templates**: Use `<template>` tag format for Glimmer components (`.gjs`/`.gts`)
- **TypeScript**: Prefer explicit types for public APIs
- **Imports**: Use workspace dependencies (`workspace:*`) for internal packages

## CI/CD Pipeline (.github/workflows/ci.yml)

The CI pipeline runs on every PR and push to main:

1. **install_dependencies** - Installs with `pnpm i` and builds with `turbo build --force`
2. **build_tests** - Builds test artifacts
3. **build_prod** - Builds production apps, uploads artifacts
4. **lints** - Runs full lint suite (must pass)
5. **tests** - Matrix tests across Node, Chrome, Firefox
6. **DeployProduction** (main only) - Deploys to Cloudflare Pages

### Important CI Notes

- Turbo uses `--force` flag in CI to ensure fresh builds
- All lint checks must pass before merge
- Test failures block deployment
- Production deploys only happen on main branch
- Build artifacts are cached between jobs

## Common Development Tasks

### Making Changes to Packages

1. Make code changes in `packages/<package-name>/`
2. Run `pnpm --filter=<package-name> build` to rebuild
3. Test changes in dependent apps
4. Run linting: `pnpm lint` before committing

### Adding Dependencies

```bash
pnpm --filter=<package-name> add <dependency>     # Add to specific package
pnpm add -w <dependency>                          # Add to workspace root
```

**Note**: Check `pnpm.overrides` in root package.json for pinned versions before adding.

### Running Development Servers

The easiest way to work on the project:
```bash
pnpm start  # Starts REPL (4201), Tutorial (4200), and style watcher
```

This runs three processes concurrently:
- Tutorial app on http://localhost:4200
- REPL app on http://localhost:4201
- TailwindCSS watcher for live style updates

### Debugging Build Issues

1. **Clean build**: `rm -rf node_modules && pnpm i && pnpm build`
2. **Check Turbo cache**: Run with `--force` flag: `pnpm build --force`
3. **Individual package**: `pnpm --filter=<package-name> build --force`
4. **View Turbo logs**: Check `.turbo/` directory for detailed logs

## Important Environment Details

### Node & Package Manager

- **Node**: >=24.12.0 required (enforced via engines field)
- **pnpm**: v10.25.0+ required

### pnpm Configuration

- Uses workspaces (`pnpm-workspace.yaml`)
- Extensive overrides for nolyfill packages
- Patches applied to `browserslist-generator` and `ember-source`
- Peer dependency rules allow various Ember/Glimmer versions

### Known Issues & Workarounds

1. **Babel standalone**: Uses local tarball (`babel-standalone.tgz`) due to customization needs
2. **Force rebuilds**: If builds fail, use `--force` flag with Turbo commands
3. **Template linting**: Runs after build step (depends on compiled output)
4. **Type checking**: Uses Glint for Ember template type checking - may need full rebuild

## Testing Strategy

### Test Structure

- **Unit tests**: Vitest for pure JS/TS logic
- **Component tests**: QUnit + Testem for Ember components
- **Browser tests**: Chrome, Firefox, and BrowserStack for cross-browser
- **Integration tests**: Full REPL functionality tests

### Running Tests

1. Build first: `pnpm build` (test infrastructure depends on built packages)
2. Run specific tests: `pnpm --filter=<package> test:node`
3. Browser tests require built artifacts
4. CI runs full matrix: node + chrome + firefox

## Validation Checklist

Before submitting changes, ensure:

- [ ] `pnpm i` runs successfully
- [ ] `pnpm build` completes without errors
- [ ] `pnpm lint` passes all checks
- [ ] Relevant tests pass (`pnpm test` or package-specific)
- [ ] Changes work in both dev mode and production build
- [ ] No unintended changes to unrelated packages
- [ ] Commit messages are clear and descriptive

## Additional Notes

- **Monorepo**: Use Turbo's filtering to work on specific packages efficiently
- **Caching**: Turbo aggressively caches; use `--force` to bypass when needed
- **Deployment**: Only maintainers can deploy; PRs trigger preview deployments
- **Dependencies**: Renovate bot keeps dependencies updated automatically
- **Performance**: REPL compiles Ember code in-browser using Babel standalone
- **Security**: Report security issues to security@nullvoxpopuli.com

## Trust These Instructions

These instructions are comprehensive and validated. Follow them precisely to avoid common pitfalls. Only search for additional information if these instructions are incomplete or if you encounter errors not covered here.
