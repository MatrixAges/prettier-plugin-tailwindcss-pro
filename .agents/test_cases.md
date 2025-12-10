# Project Test Cases & Strategy

## Framework
The project uses **Vitest** for testing (`npm run test`), providing a fast and compatible testing environment.

## Test Structure

### 1. Integration Tests (`tests/format.test.ts`)
This is the main test suite. It:
-   Imports test cases from `tests/tests.ts`.
-   Iterates through parsers (html, babel, css, etc.).
-   Runs `format()` on input strings and asserts equality with expected output.

### 2. Test Data (`tests/tests.ts`)
Contains the actual test cases defined as arrays of `[input, expected, options]`.
-   **Examples**:
    -   `['<div class="p-0 sm:p-0"></div>', '<div class="p-0 sm:p-0"></div>']`
    -   Tests for specific parsers like `html`, `babel`, `typescript`, `css`, `less`, `scss`, `vue`, `angular`.

### 3. Fixture Tests (`tests/fixtures/`)
The `tests/fixtures` directory typically contains files for snapshot-based or file-based testing, likely used to verify behavior on larger files or specific edge cases that are cumbersome to inline in string literals. `tests/fixtures.test.ts` likely drives these tests.

## Coverage Areas

### Core Functionality
-   **Sorting**: specific class orders (e.g., layout > typography > colors).
-   **Modifiers**: `sm:`, `hover:`, `dark:` handling.
-   **Arbitrary Values**: `w-[10px]` handling.

### Configuration Options
-   **`tailwindAttributes`**: Tests regex matching for custom attributes (e.g., `data-class`).
-   **`tailwindFunctions`**: Tests regex matching for custom functions (e.g., `clsx`, `cva`).
-   **`tailwindPreserveWhitespace`**: Verifies whitespace collapsing vs preservation.

### Edge Cases
-   **Duplicates**: Ensuring duplicate classes are removed (unless disabled).
-   **Whitespace**: Handling varied whitespace in class lists (tabs, newlines).
-   **Template Literals**: Sorting inside `` `...` `` and template expressions `${...}`.
-   **Concatenation**: Handling string concatenation `class="foo " + bar`.
-   **Error Handling**: Verifying responses when config files are missing.
