# prettier-plugin-tailwindcss-pro

A clean format prettier plugin that groups tailwindcss classes.

And it forks from [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss).

Before:
```tsx
function Component() {
  return (
    <div className="shadow-lg opacity-75 border-2 rounded-lg text-xl font-bold bg-blue-500 from-blue-500 p-4 m-2 w-full h-64 flex items-center justify-between">
      Multi-category Content
    </div>
  )
}
```

After:
```tsx
function Component() {
      return (
            <div
                  className="
                        flex
                        items-center justify-between
                        w-full h-64
                        p-4
                        m-2
                        rounded-lg
                        text-xl font-bold
                        bg-blue-500
                        from-blue-500
                        border-2
                        shadow-lg
                        opacity-75
                  "
            >
                  Multi-category Content
            </div>
      )
}
```

## Features

### custom categories

tailwind-format-categories.json
```json
{
  "CustomButtons": "custom-btn",
  "Colors": "primary-color secondary-color",
  "Sizes": "large-size small-size",
  "Effects": "hover-effect shadow-md"
}
```

Before:
```tsx
function Component() {
  return (
    <div className="custom-btn primary-color large-size hover-effect shadow-md rounded-lg p-4 m-2">
      Custom Categories Content
    </div>
  )
}
```

After:
```tsx
function Component() {
      return (
            <div
                  className="
                        custom-btn
                        primary-color
                        large-size
                        hover-effect shadow-md
                        rounded-lg p-4 m-2
                  "
            >
                  Custom Categories Content
            </div>
      )
}
```

### dynamic wrapping

Before:
```tsx
function Component() {
  return (
    <div
      className="opacity-0 opacity-5 opacity-10 opacity-20 opacity-25 opacity-30 opacity-40 opacity-50 opacity-60 opacity-70 opacity-75 opacity-80 opacity-90 opacity-95 opacity-100 transition-none transition-all transition-colors transition-opacity transition-shadow transition-transform ease-linear ease-in ease-out ease-in-out duration-75 duration-100 duration-150 duration-200 duration-300 duration-500 duration-700 duration-1000"
    >
      Dynamic wrapping test
    </div>
  )
}
```

After:
```tsx
function Component() {
      return (
            <div
                  className="
                        opacity-0 opacity-5 opacity-10 opacity-20 opacity-25 opacity-30 opacity-40 opacity-50 opacity-60 opacity-70 opacity-75 opacity-80 opacity-90 opacity-95 opacity-100
                        transition-none transition-all transition-colors transition-opacity transition-shadow transition-transform
                        duration-75 duration-100 duration-150 duration-200 duration-300 duration-500 duration-700 duration-1000
                        ease-linear ease-in ease-out ease-in-out
                  "
            >
                  Dynamic wrapping test
            </div>
      )
}
```

### utils function in className

Before:
```tsx
function Component() {
  return (
    <div className={cx("custom-btn primary-color large-size hover-effect shadow-md rounded-lg p-4 m-2","shadow-lg opacity-75 border-2 rounded-lg text-xl font-bold bg-blue-500 from-blue-500 p-4 m-2 w-full h-64 flex items-center justify-between")}>
      Custom Categories Content
    </div>
  )
}
```

After:
```tsx
function Component() {
      return (
            <div
                  className={cx(
                        "
                        p-4
                        m-2
                        rounded-lg
                        shadow-md
                        custom-btn primary-color large-size hover-effect
                  ",
                        "
                        flex
                        items-center justify-between
                        w-full h-64
                        p-4
                        m-2
                        rounded-lg
                        text-xl font-bold
                        bg-blue-500
                        from-blue-500
                        border-2
                        shadow-lg
                        opacity-75
                  "
                  )}
            >
                  Custom Categories Content
            </div>
      )
}
```

### template string

Before:
```tsx
function Component() {
  const dynamicClass = ''
  return (
    <div className={`shadow-lg opacity-75 border-2 rounded-lg text-xl font-bold bg-blue-500 from-blue-500 p-4 m-2 w-full h-64 flex items-center justify-between ${dynamicClass}`}>
      Multi-category Content
    </div>
  )
}
```

After:
```tsx
function Component() {
      const dynamicClass = ''
      return (
            <div
                  className={`
                        flex
                        items-center justify-between
                        w-full h-64
                        p-4
                        m-2
                        rounded-lg
                        text-xl font-bold
                        bg-blue-500
                        from-blue-500
                        border-2
                        shadow-lg
                        opacity-75
                        ${dynamicClass}
                  `}
            >
                  Multi-category Content
            </div>
      )
}
```

## Installation

To get started, install `prettier-plugin-tailwindcss-pro` as a dev-dependency:

```sh
npm install -D prettier prettier-plugin-tailwindcss-pro
```

Then add the plugin to your [Prettier configuration](https://prettier.io/docs/en/configuration.html):

```json5
// .prettierrc
{
  "useTailwindFormat": true,
  "plugins": ["prettier-plugin-tailwindcss-pro"]

// custom categories
// "useTailwindFormatCategories": "tailwind-format-categories.json",
}
```

When using a JavaScript config, you can import the types for IntelliSense:

```js
// prettier.config.js

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  plugins: ["prettier-plugin-tailwindcss-pro"],
}
```

## Default Categories

```ts
const defaultCategories = {
  Position: "relative absolute fixed sticky",
  PositionSides: "inset- top- right- bottom-",
  PositionSidesExt: "left- float- clear- isolate",
  
  Layout: "container block inline hidden",
  LayoutDisplay: "visible contents table flow-root",
  LayoutBox: "box- aspect- columns- break-",
  LayoutOverflow: "overflow- overscroll- object- z-",
  
  Flexbox: "flex flex- shrink- grow-",
  FlexUtils: "basis- order- wrap- flex-nowrap",
  Grid: "grid grid- col- row-",
  GridUtils: "auto- grid-flow- place- content-",
  Alignment: "items- justify- self- justify-self-",
  
  Sizing: "w- h- size- max-w-",
  SizingMinMax: "min-w- min-h- max-h- fit-",
  
  Spacing: "space- gap- divide-",
  Padding: "p- px- py- pt-",
  PaddingExt: "pb- pl- pr-",
  Margin: "m- mx- my- mt-",
  MarginExt: "mb- ml- mr-",
  
  Shape: "rounded rounded- circle- square-",
  
  Typography: "text- font- leading- tracking-",
  TypographyStyle: "italic not-italic underline no-underline",
  TypographyDecor: "decoration- underline-offset- uppercase lowercase",
  TypographyLayout: "truncate break- whitespace- list-",
  TypographyAlign: "align- text-left text-center text-right",
  
  Background: "bg- gradient- mix-blend- bg-blend-",
  Gradients: "from- via- to-",
  
  Borders: "border border- outline- outline",
  Rings: "ring ring- ring-offset- divide-",
  
  Shadow: "shadow- drop-shadow-",
  
  Effects: "opacity- filter- backdrop- blur-",
  Filters: "brightness- contrast- grayscale- hue-rotate-",
  FiltersExt: "invert- saturate- sepia-",
  
  Transforms: "transform- scale- rotate- translate-",
  TransformsExt: "skew- origin- will-change- perspective-",
  
  Transitions: "transition- duration- ease- delay-",
  Animation: "animate-",
  
  State: "group* peer* has-* data-*",
  StateInteractive: "open: checked: disabled: visited:",
  StateEmpty: "empty: read-only: required: valid:",
  StateAria: "aria-*",

  Action: "hover: active: focus: focus-",
  ActionExt: "focus-within: focus-visible: target: selection:",
  
  Before: "before:",
  After: "after:",
  Dark: "dark:",
  Media: "sm: md: lg: xl:",
  MediaExt: "2xl: min-[ max-[ print:"
} 
```

## Options

### Specifying your Tailwind stylesheet path (Tailwind CSS v4+)

When using Tailwind CSS v4 you must specify your CSS file entry point, which includes your theme, custom utilities, and other Tailwind configuration options. To do this, use the `tailwindStylesheet` option in your Prettier configuration.

Note that paths are resolved relative to the Prettier configuration file.

```json5
// .prettierrc
{
  "tailwindStylesheet": "./resources/css/app.css"
}
```

### Specifying your Tailwind JavaScript config path (Tailwind CSS v3)

To ensure that the class sorting takes into consideration any of your project's Tailwind customizations, it needs access to your [Tailwind configuration file](https://tailwindcss.com/docs/configuration) (`tailwind.config.js`).

By default the plugin will look for this file in the same directory as your Prettier configuration file. However, if your Tailwind configuration is somewhere else, you can specify this using the `tailwindConfig` option in your Prettier configuration.

Note that paths are resolved relative to the Prettier configuration file.

```json5
// .prettierrc
{
  "tailwindConfig": "./styles/tailwind.config.js"
}
```

If a local configuration file cannot be found the plugin will fallback to the default Tailwind configuration.

## Sorting non-standard attributes

By default this plugin sorts classes in the `class` attribute, any framework-specific equivalents like `className`, `:class`, `[ngClass]`, and any Tailwind `@apply` directives.

You can sort additional attributes using the `tailwindAttributes` option, which takes an array of attribute names:

```json5
// .prettierrc
{
  "tailwindAttributes": ["myClassList"]
}
```

With this configuration, any classes found in the `myClassList` attribute will be sorted:

```jsx
function MyButton({ children }) {
  return (
    <button myClassList="rounded bg-blue-500 px-4 py-2 text-base text-white">
      {children}
    </button>
  );
}
```

### Using regex patterns

You can also use regular expressions to match multiple attributes. Patterns should be enclosed in forward slashes. Note that JS regex literals are not supported with Prettier:

```json5
// .prettierrc
{
  "tailwindAttributes": ["myClassList", "/data-.*/"]
}
```

This example will sort classes in the `myClassList` attribute as well as any attribute starting with `data-`:

```jsx
function MyButton({ children }) {
  return (
    <button
      myClassList="rounded bg-blue-500 px-4 py-2 text-base text-white"
      data-theme="dark:bg-gray-800 bg-white"
      data-classes="flex items-center"
    >
      {children}
    </button>
  );
}
```

## Sorting classes in function calls

In addition to sorting classes in attributes, you can also sort classes in strings provided to function calls. This is useful when working with libraries like [clsx](https://github.com/lukeed/clsx) or [cva](https://cva.style/).

You can sort classes in function calls using the `tailwindFunctions` option, which takes a list of function names:

```json5
// .prettierrc
{
  "tailwindFunctions": ["clsx"]
}
```

With this configuration, any classes in `clsx()` function calls will be sorted:

```jsx
import clsx from 'clsx'

function MyButton({ isHovering, children }) {
  let classes = clsx(
    'rounded bg-blue-500 px-4 py-2 text-base text-white',
    {
      'bg-blue-700 text-gray-100': isHovering,
    },
  )

  return (
    <button className={classes}>
      {children}
    </button>
  )
}
```

## Sorting classes in template literals

This plugin also enables sorting of classes in tagged template literals.

You can sort classes in template literals using the `tailwindFunctions` option, which takes a list of function names:

```json5
// .prettierrc
{
  "tailwindFunctions": ["tw"],
}
```

With this configuration, any classes in template literals tagged with `tw` will automatically be sorted:

```jsx
import { View, Text } from 'react-native'
import tw from 'twrnc'

function MyScreen() {
  return (
    <View style={tw`bg-white p-4 dark:bg-black`}>
      <Text style={tw`text-md text-black dark:text-white`}>Hello World</Text>
    </View>
  )
}
```

This feature can be used with third-party libraries like `twrnc` or you can create your own tagged template by defining this "identity" function:

```js
const tw = (strings, ...values) => String.raw({ raw: strings }, ...values)
```

Once added, tag your strings with the function and the plugin will sort them:

```js
const mySortedClasses = tw`bg-white p-4 dark:bg-black`
```

### Using regex patterns

Like the `tailwindAttributes` option, the `tailwindFunctions` option also supports regular expressions to match multiple function names. Patterns should be enclosed in forward slashes. Note that JS regex literals are not supported with Prettier.

## Preserving whitespace

This plugin automatically removes unnecessary whitespace between classes to ensure consistent formatting. If you prefer to preserve whitespace, you can use the `tailwindPreserveWhitespace` option:

```json5
// .prettierrc
{
  "tailwindPreserveWhitespace": true,
}
```

With this configuration, any whitespace surrounding classes will be preserved:

```jsx
import clsx from 'clsx'

function MyButton({ isHovering, children }) {
  return (
    <button className=" rounded  bg-blue-500 px-4  py-2     text-base text-white ">
      {children}
    </button>
  )
}
```

## Preserving duplicate classes

This plugin automatically removes duplicate classes from your class lists. However, this can cause issues in some templating languages, like Fluid or Blade, where we can't distinguish between classes and the templating syntax.

If removing duplicate classes is causing issues in your project, you can use the `tailwindPreserveDuplicates` option to disable this behavior:

```json5
// .prettierrc
{
  "tailwindPreserveDuplicates": true,
}
```

With this configuration, anything we perceive as duplicate classes will be preserved:

```html
<div
  class="
    {f:if(condition: isCompact, then: 'grid-cols-3', else: 'grid-cols-5')}
    {f:if(condition: isDark, then: 'bg-black/50', else: 'bg-white/50')}
    grid gap-4 p-4
  "
>
</div>
```

## Compatibility with other Prettier plugins

This plugin uses Prettier APIs that can only be used by one plugin at a time, making it incompatible with other Prettier plugins implemented the same way. To solve this we've added explicit per-plugin workarounds that enable compatibility with the following Prettier plugins:

- `@ianvs/prettier-plugin-sort-imports`
- `@prettier/plugin-pug`
- `@shopify/prettier-plugin-liquid`
- `@trivago/prettier-plugin-sort-imports`
- `prettier-plugin-astro`
- `prettier-plugin-css-order`
- `prettier-plugin-jsdoc`
- `prettier-plugin-multiline-arrays`
- `prettier-plugin-organize-attributes`
- `prettier-plugin-organize-imports`
- `prettier-plugin-svelte`
- `prettier-plugin-sort-imports`

One limitation with this approach is that `prettier-plugin-tailwindcss` *must* be loaded last.

```json5
// .prettierrc
{
  // ..
  "plugins": [
    "prettier-plugin-svelte",
    "prettier-plugin-organize-imports",
    "prettier-plugin-tailwindcss-pro" // MUST come last
  ]
}
```
