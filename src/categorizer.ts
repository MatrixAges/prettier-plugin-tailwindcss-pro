/**
 * Categorizer for organizing Tailwind CSS classes into categories
 * when useTailwindFormat is enabled.
 */

import { defaultCategories } from './defaults.js'
import type { TransformerEnv } from './types'

interface CategoryBlock {
  name: string
  groups: string[][] // groups of classes to be wrapped
}

/**
 * Categorizes Tailwind CSS classes based on the default categories configuration.
 * Supports wildcard prefixes (e.g., 'group*' matches 'group', 'group-', 'group/')
 * 
 * @param classList - Array of class names to categorize
 * @param env - Transformer environment
 * @param indent - Indentation string for each line
 * @param customCategories - Optional custom categories to override defaults
 * @param tabWidth - Tab width for calculating closing indentation
 * @param closingIndent - Closing indentation string
 * @param sorter - Optional function to sort a list of classes (used for sorting blocks)
 * @returns Formatted string with proper indentation
 */
export function categorizeTailwindClasses(
  classList: string[],
  env: TransformerEnv,
  indent: string = '  ',
  customCategories?: Record<string, string>,
  tabWidth: number = 2,
  closingIndent?: string,
  sorter?: (classList: string[]) => string[]
): string {
  // Ensure class names are clean
  classList = classList.map(c => c.trim()).filter(Boolean)

  if (classList.length === 0) {
    return ''
  }

  // Define processing phases
  const phases: Record<string, string>[] = []
  
  // Phase 1: Custom Categories (if provided)
  if (customCategories) {
    phases.push(customCategories)
  }
  
  // Phase 2: Default Categories (only if no custom categories provided)
  if (!customCategories) {
    phases.push(defaultCategories)
  }

  let currentLeftovers = [...classList]
  const allBlocks: CategoryBlock[] = []

  // Process phases
  for (const categories of phases) {
    if (currentLeftovers.length === 0) break

    const { blocks, leftovers } = processCategories(
      currentLeftovers,
      categories
    )
    
    allBlocks.push(...blocks)
    currentLeftovers = leftovers
  }

  // Handle Uncategorized
  // Put all uncategorized classes in a single group so they stay together
  if (currentLeftovers.length > 0) {
    allBlocks.push({
      name: 'Uncategorized',
      groups: [currentLeftovers]
    })
  }

  // Sort Blocks if sorter is provided
  if (sorter && allBlocks.length > 0) {
    // 1. Identify valid blocks (non-empty)
    const validBlocks = allBlocks.filter(b => b.groups.length > 0 && b.groups[0].length > 0)
    
    // 2. Extract representative class from each block (first class of first group)
    const representatives = validBlocks.map(b => b.groups[0][0])
    
    // 3. Sort representatives using the provided sorter
    const sortedRepresentatives = sorter(representatives)
    
    // 4. Map representative -> index
    const sortOrder = new Map<string, number>()
    sortedRepresentatives.forEach((cls, index) => {
      sortOrder.set(cls, index)
    })
    
    // 5. Sort blocks based on their representative's index
    allBlocks.sort((a, b) => {
      // Handle empty blocks just in case (though filtered above)
      if (a.groups.length === 0 || a.groups[0].length === 0) return 1
      if (b.groups.length === 0 || b.groups[0].length === 0) return -1
      
      const repA = a.groups[0][0]
      const repB = b.groups[0][0]
      
      const indexA = sortOrder.has(repA) ? sortOrder.get(repA)! : Number.MAX_SAFE_INTEGER
      const indexB = sortOrder.has(repB) ? sortOrder.get(repB)! : Number.MAX_SAFE_INTEGER
      
      return indexA - indexB
    })
  }

  // Format Lines from Blocks
  const resultLines: string[] = []
  
  allBlocks.forEach(block => {
    if (block.groups.length > 0) {
      const blockLines = formatCategoryWithLineWrapping(
        block.groups,
        env.options.printWidth || 80,
        indent,
        tabWidth
      )
      resultLines.push(...blockLines)
    }
  })

  // Format as multi-line string with indentation
  if (resultLines.length === 0) {
    return ''
  }

  // Return formatted string with newlines and indentation
  const classLines = resultLines.map(line => indent + line).join('\n')
  
  // Use closingIndent if provided, otherwise default to indent
  const finalIndent = closingIndent !== undefined ? closingIndent : indent

  return '\n' + classLines + '\n' + finalIndent
}

/**
 * Helper to process a list of classes against a set of categories
 */
function processCategories(
  classList: string[],
  categories: Record<string, string>
): { blocks: CategoryBlock[], leftovers: string[] } {
  const categoryGroups: Map<string, Map<string, string[]>> = new Map()
  const leftovers: string[] = []

  // Initialize category groups
  Object.keys(categories).forEach((category) => {
    categoryGroups.set(category, new Map())
  })

  // Build prefix map
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
      if (!rawPrefix.trim()) return

      const isWildcard = rawPrefix.endsWith('*')
      const prefix = isWildcard ? rawPrefix.slice(0, -1) : rawPrefix
      
      prefixMap.push({
        category,
        prefix,
        rawPrefix,
        isWildcard,
        length: prefix.length,
      })

      const categoryMap = categoryGroups.get(category)!
      if (!categoryMap.has(rawPrefix)) {
        categoryMap.set(rawPrefix, [])
      }
    })
  })

  // Sort prefixes by length
  prefixMap.sort((a, b) => b.length - a.length)

  // Categorize
  classList.forEach((cls) => {
    let matched = false

    for (const { category, prefix, rawPrefix, isWildcard } of prefixMap) {
      if (cls.startsWith(prefix)) {
        if (isWildcard) {
          if (cls === prefix || cls.startsWith(prefix + '-') || cls.startsWith(prefix + '/')) {
            const categoryMap = categoryGroups.get(category)!
            const group = categoryMap.get(rawPrefix)!
            group.push(cls)
            matched = true
            break
          }
        } else {
          const categoryMap = categoryGroups.get(category)!
          const group = categoryMap.get(rawPrefix)!
          group.push(cls)
          matched = true
          break
        }
      }
    }

    if (!matched) {
      leftovers.push(cls)
    }
  })

  // Convert to Blocks
  const blocks: CategoryBlock[] = []
  
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
      blocks.push({
        name: category,
        groups
      })
    }
  })

  return { blocks, leftovers }
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
  // Filter out any empty groups just in case
  let remainingGroups = [...groups].filter(g => g.length > 0)
  
  // Adjust printWidth to account for indentation
  const indentWidth = indent.split('').reduce((acc, char) => acc + (char === '\t' ? tabWidth : 1), 0)
  const effectivePrintWidth = printWidth - indentWidth

  while (remainingGroups.length > 0) {
    let currentLineGroups = [...remainingGroups]
    let currentLineString = currentLineGroups.map((g) => g.map(c => c.trim()).join(' ')).join(' ')

    // If line exceeds printWidth and has more than one group, remove the last group
    while (currentLineString.length > effectivePrintWidth && currentLineGroups.length > 1) {
      currentLineGroups.pop()
      currentLineString = currentLineGroups.map((g) => g.map(c => c.trim()).join(' ')).join(' ')
    }

    // Add the line
    lines.push(currentLineString)

    // Remove processed groups from remaining
    remainingGroups = remainingGroups.slice(currentLineGroups.length)
  }

  return lines
}
