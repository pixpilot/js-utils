# @pixpilot/changeset

A tool for publishing packages using Changesets with automated NPM authentication.

## Installation

```bash
pnpm add -D @pixpilot/changeset
```

## Usage

This package provides a CLI tool to publish packages with Changesets. It automatically reads the NPM_TOKEN from a `.env` file and creates a temporary `.npmrc` file for authentication.

### CLI Usage

```bash
changeset-publish [options]
```

#### Options

- `--dry-run, -d` Run changeset publish with --dry-run flag
- `--next` Publish to the next tag
- `--help, -h` Show this help message

#### Examples

```bash
# Dry run publish
changeset-publish --dry-run

# Publish to next tag
changeset-publish --next

# Show help
changeset-publish --help
```

### Programmatic Usage

```typescript
import { publish } from '@pixpilot/changeset';

publish({ isDryRun: false, isNext: false });
```

## Setup

1. Create a `.env` file in your project root with your NPM token:

   ```
   NPM_TOKEN=your_npm_token_here
   ```

2. Run the publish command:
   ```bash
   pnpm run publish
   ```
