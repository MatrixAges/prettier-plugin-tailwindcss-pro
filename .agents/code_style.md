# Project Code Style

## Formatting (Prettier)
The project enforces a strict code style using **Prettier**. The configuration in `.prettierrc` specifies:
-   **Print Width**: 120 characters (wider than the default 80).
-   **Tab Width**: 6 spaces (unusually large indentation).
-   **Use Tabs**: `true` (uses tabs for indentation instead of spaces).
-   **Semi**: `false` (no semicolons at the end of statements).
-   **Single Quote**: `true` (uses single quotes `'` instead of double `"`).
-   **Trailing Comma**: `none` (no trailing commas).
-   **Arrow Parens**: `avoid` (omits parentheses for single-argument arrow functions).

## Import Sorting
Imports are automatically sorted using **`@ianvs/prettier-plugin-sort-imports`**.
-   **Order**:
    1.  React
    2.  Third-party modules
    3.  Scoped `@` packages
    4.  Relative imports (`./`, `../`)
    5.  CSS modules
    6.  Types
-   **Case Sensitive**: `false`.

## TypeScript Conventions
-   **Strict Mode**: The project appears to use strict TypeScript settings.
-   **Type Imports**: Explicit `import type` is used for type definitions.
-   **Exhaustive Checks**: Uses explicit checks like `isStringLiteral` to narrow types safely during AST traversal.
-   **Any**: Usage of `any` is present but typically localized to AST node handling where types can be complex or loosely typed in external libraries.

## Linter
While an explicit ESLint config file wasn't deeply analyzed, the presence of standard dependencies and code quality suggests standard linting rules are likely in place, generally deferring formatting concerns to Prettier.
