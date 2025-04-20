The code is based on https://github.com/qdanik/eslint-plugin-path

An ESLint plugin for enforcing consistent imports across project.

## Installation

```sh
pnpm install -D @gergelyszerovay/eslint-plugin-path-boundary-imports
```

## ESlint 9+

If you are using ESLint 9 or later, you can use the plugin without any additional configuration. Just install it and add it to your ESLint configuration.

```js
import eslintPluginPathBoundaryImports from "@gergelyszerovay/eslint-plugin-path-boundary-imports";

export default [
  {
    files: ["*.{js,ts,jsx,tsx}"],
    plugins: {
      path: eslintPluginPathBoundaryImports,
    },
    rules: {
      "path/enforce-import-pattern": [
        "error",
        {
          levels: 2,
        },
      ],
    },
  },
];
```

## Custom tsconfig/jsconfig paths

If you are using custom paths in your `tsconfig.json` or `jsconfig.json` file, you can specify the path to the configuration file in the ESLint configuration file. You can do this by adding the following lines to your config file:

```json
{
  "settings": {
    "path": {
      "config": "tsconfig.json" // or "./jsconfig.json"
    }
  }
}
```

# Rule: eslint-plugin-path-boundary-imports/enforce-import-pattern

Enforces a consistent import pattern across feature boundaries. This rule ensures that imports between features use path aliases, while imports within the same feature use relative paths.

**Fixable:** This rule is automatically fixable using the `--fix` command line option.

## Example

These examples have the following project structure and path alias configuration:

```
project
└─── src
    └─── features
        └─── user-management
        └─── payment-processing
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@features/*": ["./src/features/*"]
    }
  }
}
```

## The Rule in Action

### Cross-Feature Imports

When importing from a different feature, use the path alias:

#### Pass

```typescript
// inside "src/features/user-management/user.ts"
import { processPayment } from "@features/payment-processing/pay";
```

#### Fail

```typescript
// inside "src/features/user-management/user.ts"
import { processPayment } from "../payment-processing/pay"; // Should use path alias
```

### Within-Feature Imports

When importing from within the same feature, use relative paths:

#### Pass

```typescript
// inside "src/features/user-management/user.ts"
import { userData } from "./internal/data";
```

#### Fail

```typescript
// inside "src/features/user-management/user.ts"
import { userData } from "@features/user-management/internal/data"; // Should use relative path
```

## Options

This rule supports the following options:

### `levels: number`:

- default: `2`

Determines how many levels of the path structure define a feature boundary. For a typical `@features/feature-name` structure, `2` is the correct setting (counting `@features` as level 1 and the feature name as level 2).

## Configuration Example

```json
{
  "rules": {
    "path/enforce-import-pattern": ["error", { "levels": 2 }]
  }
}
```

## Why Use This Rule?

This rule helps maintain a consistent import pattern in your codebase, which provides several benefits:

1. **Clear Feature Boundaries**: By using path aliases for cross-feature imports, the codebase clearly indicates when module boundaries are crossed
2. **Refactoring Safety**: Relative imports within features make it easier to move files within a feature without breaking imports
3. **Improved Readability**: The import pattern makes the relationship between modules more immediately apparent to developers
