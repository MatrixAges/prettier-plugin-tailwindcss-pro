# Project Features

## Core Functionality
The primary feature of `prettier-plugin-tailwindcss` is enforcing a consistent order for Tailwind CSS classes. It parses class attributes and sorts the utilities based on the official Tailwind recommendation (typically following the cascade).

## Supported Languages & Parsers
The plugin supports a wide range of file types by hooking into various Prettier parsers:
-   **JavaScript / TypeScript**: Sorts classes in strings, template literals, and JSX `className` attributes.
-   **HTML**: Sorts `class` attributes.
-   **CSS / SCSS / Less**: Sorts classes in `@apply` directives.
-   **Vue**: Sorts classes in `<template>` and dynamic bindings.
-   **Angular**: Sorts classes in `[class]` and `ngClass`.
-   **Svelte**: Sorts `class` attributes.
-   **Astro**: Sorts `class` attributes.
-   **Liquid / Glimmer**: Support for specific template engines.

## Configuration
The plugin is highly configurable through Prettier options:

### Tailwind Configuration
-   **`tailwindConfig`**: Path to a specific `tailwind.config.js` file.
-   **`tailwindEntryPoint`**: Path to the CSS entry point (for v4 compatibility).

### Custom Class Locations
Users can tell the plugin where to look for Tailwind classes beyond standard attributes:
-   **`tailwindAttributes`**: Array of attribute names (strings or regex) to sort.
    -   Example: `['myClass', 'data-.*']`
-   **`tailwindFunctions`**: Array of function names (strings or regex) to sort in tagged template literals or function calls.
    -   Example: `['clsx', 'cva']`

### Formatting Options
-   **`tailwindPreserveWhitespace`**: If `true`, prevents the plugin from collapsing whitespace between classes.
-   **`tailwindPreserveDuplicates`**: If `true`, prevents removal of duplicate class names.

## Version Compatibility
-   Supports **Tailwind CSS v3**.
-   Supports **Tailwind CSS v4** (including "parasite" utility detection).
