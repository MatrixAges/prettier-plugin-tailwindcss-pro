import type { TransformerEnv } from './types'
import { bigSign } from './utils'
import { categorizeTailwindClasses } from './categorizer.js'

function reorderClasses(classList: string[], { env }: { env: TransformerEnv }) {
  let orderedClasses = env.context.getClassOrder(classList)

  return orderedClasses.sort(([nameA, a], [nameZ, z]) => {
    // Move `...` to the end of the list
    if (nameA === '...' || nameA === '…') return 1
    if (nameZ === '...' || nameZ === '…') return -1

    if (a === z) return 0
    if (a === null) return -1
    if (z === null) return 1
    return bigSign(a - z)
  })
}

export function sortClasses(
  classStr: string,
  {
    env,
    ignoreFirst = false,
    ignoreLast = false,
    removeDuplicates = true,
    collapseWhitespace = { start: true, end: true },
    useClosingIndent = true,
  }: {
    env: TransformerEnv
    ignoreFirst?: boolean
    ignoreLast?: boolean
    removeDuplicates?: boolean
    collapseWhitespace?: false | { start: boolean; end: boolean }
    useClosingIndent?: boolean
  },
): string {
  if (typeof classStr !== 'string' || classStr === '') {
    return classStr
  }

  // Ignore class attributes containing `{{`, to match Prettier behaviour:
  // https://github.com/prettier/prettier/blob/8a88cdce6d4605f206305ebb9204a0cabf96a070/src/language-html/embed/class-names.js#L9
  if (classStr.includes('{{')) {
    return classStr
  }

  // When useTailwindFormat is enabled, use category-based formatting
  if (env.options.useTailwindFormat) {
    let parts = classStr.split(/([\t\r\f\n ]+)/)
    let classes = parts.filter((_, i) => i % 2 === 0).filter(Boolean)
    
    if (classes.length === 0) {
      return classStr
    }

    // Determine indentation based on tabWidth
    // For JSX className attributes, we need extra indentation:
    // Base indent (2 for function) + return statement (2) + div (2) + className attr (2) = 8 spaces typically
    const tabWidth = env.options.tabWidth || 2
    const useTabs = env.options.useTabs || false
    const baseIndent = useTabs ? '\t' : ' '.repeat(tabWidth)
    
    // For className in JSX, use 4 levels of indentation (8 spaces with tabWidth=2)
    const indent = baseIndent.repeat(4)
    // Closing indent should be one level less (aligned with className)
    // Only use closingIndent if useClosingIndent is true
    const closingIndent = useClosingIndent ? baseIndent.repeat(3) : undefined

    // Extract custom categories if provided
    // Support file path to JSON file
    let customCategories: Record<string, string> | undefined
    const categoriesPath = env.options.useTailwindFormatCategories
    
    if (categoriesPath && typeof categoriesPath === 'string') {
      try {
        // Import fs module dynamically
        const fs = require('fs')
        const path = require('path')
        
        // Resolve path relative to the config file location or cwd
        const resolvedPath = path.isAbsolute(categoriesPath) 
          ? categoriesPath 
          : path.resolve(process.cwd(), categoriesPath)
        
        // Read and parse JSON file
        const fileContent = fs.readFileSync(resolvedPath, 'utf-8')
        customCategories = JSON.parse(fileContent)
      } catch (e) {
        // If file reading or parsing fails, ignore and use defaults
        console.warn(`Failed to load custom categories from ${categoriesPath}:`, e)
        customCategories = undefined
      }
    }

    // Categorize classes and return formatted string with indentation
    return categorizeTailwindClasses(classes, env, indent, customCategories, tabWidth, closingIndent)
  }

  if (env.options.tailwindPreserveWhitespace) {
    collapseWhitespace = false
  }

  // This class list is purely whitespace
  // Collapse it to a single space if the option is enabled
  if (/^[\t\r\f\n ]+$/.test(classStr) && collapseWhitespace) {
    return ' '
  }

  let result = ''
  let parts = classStr.split(/([\t\r\f\n ]+)/)
  let classes = parts.filter((_, i) => i % 2 === 0)
  let whitespace = parts.filter((_, i) => i % 2 !== 0)

  if (classes[classes.length - 1] === '') {
    classes.pop()
  }

  if (collapseWhitespace) {
    whitespace = whitespace.map(() => ' ')
  }

  let prefix = ''
  if (ignoreFirst) {
    prefix = `${classes.shift() ?? ''}${whitespace.shift() ?? ''}`
  }

  let suffix = ''
  if (ignoreLast) {
    suffix = `${whitespace.pop() ?? ''}${classes.pop() ?? ''}`
  }

  let { classList, removedIndices } = sortClassList(classes, {
    env,
    removeDuplicates,
  })

  // Remove whitespace that appeared before a removed classes
  whitespace = whitespace.filter((_, index) => !removedIndices.has(index + 1))

  for (let i = 0; i < classList.length; i++) {
    result += `${classList[i]}${whitespace[i] ?? ''}`
  }

  if (collapseWhitespace) {
    prefix = prefix.replace(/\s+$/g, ' ')
    suffix = suffix.replace(/^\s+/g, ' ')

    result = result
      .replace(/^\s+/, collapseWhitespace.start ? '' : ' ')
      .replace(/\s+$/, collapseWhitespace.end ? '' : ' ')
  }

  return prefix + result + suffix
}

export function sortClassList(
  classList: string[],
  {
    env,
    removeDuplicates,
  }: {
    env: TransformerEnv
    removeDuplicates: boolean
  },
) {
  // Re-order classes based on the Tailwind CSS configuration
  let orderedClasses = reorderClasses(classList, { env })

  // Remove duplicate Tailwind classes
  if (env.options.tailwindPreserveDuplicates) {
    removeDuplicates = false
  }

  let removedIndices = new Set<number>()

  if (removeDuplicates) {
    let seenClasses = new Set<string>()

    orderedClasses = orderedClasses.filter(([cls, order], index) => {
      if (seenClasses.has(cls)) {
        removedIndices.add(index)
        return false
      }

      // Only consider known classes when removing duplicates
      if (order !== null) {
        seenClasses.add(cls)
      }

      return true
    })
  }

  return {
    classList: orderedClasses.map(([className]) => className),
    removedIndices,
  }
}
