# Background Friends

A collection of ready-to-use, animated React background components for modern web applications, each with independent versioning and publishing.

## Monorepo Structure

This is a monorepo where each component is independently publishable and has its own demo/tests/workflow:

```
background-friends/
├── packages/
│   ├── jellyfish/
│   │   ├── src/               # Main component source
│   │   ├── demo/              # Component-specific demo (not published to NPM)
│   │   ├── package.json       # Independent versioning
│   │   └── ...
│   └── [future components]/
│       ├── src/
│       ├── demo/
│       ├── package.json
│       └── ...
└── package.json               # Root workspace config
```

## Quick Start

### Development

Install dependencies:
```bash
npm install
```

Run the jellyfish demo (localhost:8080):
```bash
npm run demo:jellyfish
```

Build all packages:
```bash
npm run build:packages
```

### Publishing

Each package publishes independently with its own GitHub Actions workflow:

```bash
cd packages/jellyfish
npm publish
```

## Packages

### @background-friends/jellyfish

An animated jellyfish React component featuring:
- Smooth rotation on direction changes (swims naturally)
- Infinite loop video animation with chroma key
- Responsive canvas rendering
- Configurable count, speed, size, and rotation easing

[See jellyfish README](./packages/jellyfish/README.md)

## Component Workflow Pattern

Each component (e.g., jellyfish, newThing) has:

1. **Source code** at `packages/[component]/src/`
2. **NPM package config** at `packages/[component]/package.json`
3. **Local demo** at `packages/[component]/demo/` (not published)
4. **Separate GitHub Actions** workflow for CI/package publishing

This keeps components completely independent with their own version history and release cycles.

## Documentation

- [SETUP.md](./SETUP.md) - Detailed setup guide
- [QUICK.md](./QUICK.md) - Command reference
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Adding new components
- [MIGRATION.md](./MIGRATION.md) - What changed from old structure
- [OVERVIEW.md](./OVERVIEW.md) - Architecture overview
- [ROTATION_ALGORITHM.md](./ROTATION_ALGORITHM.md) - Deep dive on smooth rotation

