# js-utils

> A modern TypeScript monorepo managed with pnpm and TurboRepo.

## 🚀 Getting Started

### Development

Build all packages:

```sh
pnpm build
```

Run tests:

```sh
pnpm test
```

Lint and format:

```sh
pnpm lint
pnpm format
```

### Create a New Package

Generate a new package in the monorepo:

```sh
pnpm run turbo:gen:init
```

## 📦 Packages

### [changeset](./packages/changeset/README.md)

A utility for changesets

### [date](./packages/date/README.md)

A collection of utility functions for date manipulation and parsing.

### [env](./packages/env/README.md)

A collection of utility functions for environment detection.

### [hash](./packages/hash/README.md)

Hashing utilities

### [number](./packages/number/README.md)

A collection of utility functions for number manipulation and validation.

### [object](./packages/object/README.md)

A collection of utility functions for object manipulation and transformation.

### [string](./packages/string/README.md)

A collection of utility functions for string manipulation and validation.


## 🚢 Releases

This project uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

## 📄 License

[MIT](LICENSE)
