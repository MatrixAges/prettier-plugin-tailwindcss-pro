# Project Architecture

## Overview
`prettier-plugin-tailwindcss` is a Prettier plugin designed to automatically sort Tailwind CSS classes in various file formats. It works by wrapping existing Prettier parsers and applying class sorting transformations to the Abstract Syntax Tree (AST).

## Core Components

### 1. Entry Point (`src/index.ts`)
The main entry point initializes the plugin. It:
-   Loads other plugins.
-   Defines `createParser` logic to extend existing parsers (e.g., `babel`, `typescript`, `html`, `css`).
-   Implements parser-specific transformation logic:
    -   `transformJavaScript`: Handles JSX attributes, template literals, and tagged template expressions.
    -   `transformHtml`: Handles HTML attributes.
    -   `transformCss`: Handles `@apply` directives.
    -   Other transformers for frameworks like Astro, Svelte, Glimmer, Liquid.

### 2. Sorting Logic (`src/sorting.ts`)
This module contains the core business logic for sorting classes:
-   `sortClasses`: The main function exposed to transformers. It splits class strings, handles whitespace, and invokes `sortClassList`.
-   `sortClassList`: Sorts the array of class names based on the order defined by Tailwind's context.
-   `reorderClasses`: Uses the Tailwind context to determine the correct order of utility classes.

### 3. Configuration & Context (`src/config.ts`)
Responsible for:
-   Resolving and loading the user's `tailwind.config.js`.
-   Creating the Tailwind context which provides the class sorting order.
-   Handling different Tailwind versions (v3 vs v4).

### 4. Utilities (`src/utils.ts`)
Provides helper functions for:
-   AST traversal (`visit`).
-   String manipulation (`spliceChangesIntoString`).
-   Other common tasks.

## Dependencies
-   **prettier**: The peer dependency and core formatting engine.
-   **tailwindcss**: The CSS framework whose classes are being sorted.
-   **recast**: Used for reliable AST-to-code regeneration in some parsers.
-   **ast-types**: Used for traversing and manipulating AST nodes.
-   **jiti**: Used for loading Tailwind configuration files.

## Build System
-   **esbuild**: Used for building the plugin bundle (`scripts/_esbuild` -> `node build.mjs`).
-   **tsup**: Used for generating type definitions (`npm run postbuild`).
-   **npm scripts**:
    -   `build`: Bundles and minifies the code.
    -   `dev`: Watches for changes.
    -   `test`: Runs Vitest.
