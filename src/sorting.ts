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
    column,
  }: {
    env: TransformerEnv
    ignoreFirst?: boolean
    ignoreLast?: boolean
    removeDuplicates?: boolean
    collapseWhitespace?: false | { start: boolean; end: boolean }
    useClosingIndent?: boolean
    column?: number
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

    const tabWidth = env.options.tabWidth || 2
    const useTabs = env.options.useTabs || false
    const printWidth = env.options.printWidth || 80

    // Check if the className already has newlines (multi-line)
    const hasNewline = classStr.includes('\n')
    
    // For single-line className, check if it should be expanded to multi-line
    // Expand if there are 5+ classes (enough to benefit from categorization)
    if (!hasNewline) {
      // For single-line string, only expand if 5+ classes
      if (classes.length >= 5) {
        // Calculate indentation based on column if available
        let indent: string
        let closingIndent: string | undefined

        if (column !== undefined && column >= 0) {
          const level = column
          if (useTabs) {
            indent = '\t'.repeat(level + 1)
            closingIndent = useClosingIndent ? '\t'.repeat(level) : undefined
          } else {
            indent = ' '.repeat((level + 1) * tabWidth)
            closingIndent = useClosingIndent ? ' '.repeat(level * tabWidth) : undefined
          }
        } else {
          const baseIndent = useTabs ? '\t' : ' '.repeat(tabWidth)
          indent = baseIndent.repeat(4) // Default fallback
          closingIndent = useClosingIndent ? baseIndent.repeat(3) : undefined
        }
        
        // Extract custom categories and format
        let customCategories: Record<string, string> | undefined
        const categoriesPath = env.options.useTailwindFormatCategories
        
        if (categoriesPath && typeof categoriesPath === 'string') {
          try {
            const fs = require('fs')
            const path = require('path')
            const resolvedPath = path.isAbsolute(categoriesPath) 
              ? categoriesPath 
              : path.resolve(process.cwd(), categoriesPath)
            const fileContent = fs.readFileSync(resolvedPath, 'utf-8')
            customCategories = JSON.parse(fileContent)
          } catch (e) {
            console.warn(`Failed to load custom categories from ${categoriesPath}:`, e)
          }
        }

        return categorizeTailwindClasses(
          classes,
          env,
          indent,
          customCategories,
          tabWidth,
          closingIndent
        )
      }
    } else {
      // Already multi-line - AWLAYS force logical indentation if column is available
      let indent: string
      let closingIndent: string | undefined

      if (column !== undefined && column >= 0) {
        const level = column
        if (useTabs) {
          indent = '\t'.repeat(level + 1)
          closingIndent = useClosingIndent ? '\t'.repeat(level) : undefined
        } else {
          indent = ' '.repeat((level + 1) * tabWidth)
          closingIndent = useClosingIndent ? ' '.repeat(level * tabWidth) : undefined
        }
      } else {
        // Fallback to extraction ONLY if column is missing (e.g. non-JavaScript contexts)
        const indentMatch = classStr.match(/\n([ \t]+)/)
        if (indentMatch) {
          indent = indentMatch[1]
          if (useClosingIndent) {
            if (indent.includes('\t')) {
              closingIndent = indent.length > 1 ? indent.slice(0, -1) : ''
            } else {
              closingIndent = indent.length > tabWidth ? indent.slice(0, -tabWidth) : ''
            }
          }
        } else {
          const baseIndent = useTabs ? '\t' : ' '.repeat(tabWidth)
          indent = baseIndent.repeat(4)
          closingIndent = useClosingIndent ? baseIndent.repeat(3) : undefined
        }
      }

      // Extract custom categories if provided
      let customCategories: Record<string, string> | undefined
      const categoriesPath = env.options.useTailwindFormatCategories
      
      if (categoriesPath && typeof categoriesPath === 'string') {
        try {
          const fs = require('fs')
          const path = require('path')
          const resolvedPath = path.isAbsolute(categoriesPath) 
            ? categoriesPath 
            : path.resolve(process.cwd(), categoriesPath)
          const fileContent = fs.readFileSync(resolvedPath, 'utf-8')
          customCategories = JSON.parse(fileContent)
        } catch (e) {
          console.warn(`Failed to load custom categories from ${categoriesPath}:`, e)
        }
      }

      // Categorize classes and return formatted string with indentation
      return categorizeTailwindClasses(
        classes,
        env,
        indent,
        customCategories,
        tabWidth,
        closingIndent
      )
    }
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
