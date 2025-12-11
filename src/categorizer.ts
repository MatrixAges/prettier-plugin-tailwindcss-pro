/**
 * Categorizer for organizing Tailwind CSS classes into categories
 * when useTailwindFormat is enabled.
 */

import { defaultCategories } from './defaults.js'
import type { TransformerEnv } from './types'

/**
 * Categorizes Tailwind CSS classes based on the default categories configuration.
 * Supports wildcard prefixes (e.g., 'group*' matches 'group', 'group-', 'group/')
 * 
 * @param classList - Array of class names to categorize
 * @param env - Transformer environment
 * @param indent - Indentation string for each line
 * @param customCategories - Optional custom categories to override defaults
 * @param tabWidth - Tab width for calculating closing indentation
 * @returns Formatted string with proper indentation
 */
export function categorizeTailwindClasses(
  classList: string[],
  env: TransformerEnv,
  indent: string = '  ',
  customCategories?: Record<string, string>,
  tabWidth: number = 2,
  closingIndent?: string
): string {
  if (classList.length === 0) {
    return ''
  }

  const categories = customCategories || defaultCategories
  const categoryGroups: Map<string, Map<string, string[]>> = new Map()
  const uncategorized: string[] = []

  // Initialize category groups
  Object.keys(categories).forEach((category) => {
    categoryGroups.set(category, new Map())
  })

  // Build prefix map with category and wildcard info
  const prefixMap: Array<{
    category: string
    prefix: string
    rawPrefix: string
    isWildcard: boolean
    length: number
  }> = []

  Object.entries(categories).forEach(([category, prefixesString]) => {
    const prefixes = prefixesString.split(' ')
    prefixes.forEach((rawPrefix) => {
      const isWildcard = rawPrefix.endsWith('*')
      const prefix = isWildcard ? rawPrefix.slice(0, -1) : rawPrefix
      
      prefixMap.push({
        category,
        prefix,
        rawPrefix,
        isWildcard,
        length: prefix.length,
      })

      // Initialize the group for this prefix
      const categoryMap = categoryGroups.get(category)!
      if (!categoryMap.has(rawPrefix)) {
        categoryMap.set(rawPrefix, [])
      }
    })
  })

  // Sort prefixes by length (longest first for most specific match)
  prefixMap.sort((a, b) => b.length - a.length)

  // Categorize each class
  classList.forEach((cls) => {
    let matched = false

    for (const { category, prefix, rawPrefix, isWildcard } of prefixMap) {
      if (cls.startsWith(prefix)) {
        // For wildcard prefixes, match exactly 'prefix', 'prefix-', 'prefix/', etc.
        if (isWildcard) {
          // Must be exact match or followed by - or /
          if (cls === prefix || cls.startsWith(prefix + '-') || cls.startsWith(prefix + '/')) {
            const categoryMap = categoryGroups.get(category)!
            const group = categoryMap.get(rawPrefix)!
            group.push(cls)
            matched = true
            break
          }
        } else {
          // Regular prefix match
          const categoryMap = categoryGroups.get(category)!
          const group = categoryMap.get(rawPrefix)!
          group.push(cls)
          matched = true
          break
        }
      }
    }

    if (!matched) {
      uncategorized.push(cls)
    }
  })

  // Format the result with proper indentation
  const lines: string[] = []

  // Add uncategorized classes first
  if (uncategorized.length > 0) {
    // Treat each uncategorized class as its own group so they can wrap individually
    const uncategorizedGroups = uncategorized.map(c => [c])
    const uncategorizedLines = formatCategoryWithLineWrapping(
      uncategorizedGroups,
      env.options.printWidth || 80,
      indent,
      tabWidth
    )
    lines.push(...uncategorizedLines)
  }

  // Add categorized classes by category order
  Object.keys(categories).forEach((category) => {
    const categoryMap = categoryGroups.get(category)!
    const groups: string[][] = []

    // Collect non-empty groups
    categoryMap.forEach((groupClasses) => {
      if (groupClasses.length > 0) {
        groups.push(groupClasses)
      }
    })

    if (groups.length > 0) {
      // Apply dynamic line wrapping based on printWidth
      const categoryLines = formatCategoryWithLineWrapping(
        groups,
        env.options.printWidth || 80,
        indent,
        tabWidth
      )
      lines.push(...categoryLines)
    }
  })

  // Format as multi-line string with indentation
  if (lines.length === 0) {
    return ''
  }

  // Return formatted string with newlines and indentation
  // Each class line gets full indentation
  const classLines = lines.map(line => indent + line).join('\n')
  
  // Use closingIndent if provided, otherwise default to indent
  const finalIndent = closingIndent !== undefined ? closingIndent : indent

  return '\n' + classLines + '\n' + finalIndent
}

/**
 * Formats category groups with dynamic line wrapping.
 * When a line exceeds printWidth, the last group is moved to the next line.
 * 
 * @param groups - Array of groups (each group is an array of classes)
 * @param printWidth - Maximum line width
 * @param indent - Indentation string
 * @returns Array of formatted lines
 */
function formatCategoryWithLineWrapping(
  groups: string[][],
  printWidth: number,
  indent: string,
  tabWidth: number
): string[] {
  const lines: string[] = []
  let remainingGroups = [...groups]
  
  // Adjust printWidth to account for indentation
  const indentWidth = indent.split('').reduce((acc, char) => acc + (char === '\t' ? tabWidth : 1), 0)
  const effectivePrintWidth = printWidth - indentWidth

  while (remainingGroups.length > 0) {
    let currentLineGroups = [...remainingGroups]
    let currentLineString = currentLineGroups.map((g) => g.join(' ')).join(' ')

    // If line exceeds printWidth and has more than one group, remove the last group
    while (currentLineString.length > effectivePrintWidth && currentLineGroups.length > 1) {
      currentLineGroups.pop()
      currentLineString = currentLineGroups.map((g) => g.join(' ')).join(' ')
    }

    // Add the line
    lines.push(currentLineString)

    // Remove processed groups from remaining
    remainingGroups = remainingGroups.slice(currentLineGroups.length)
  }

  return lines
}
