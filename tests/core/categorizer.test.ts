import { describe, test, expect } from 'vitest'
import { categorizeClassesAndViewports } from '../../src/core/categorizer'
import type { ClassParseResult, FormatterConfig } from '../../src/core/types'
import { DEFAULT_CATEGORIES } from '../../src/constants/categories'

const mockConfig: FormatterConfig = {
    categories: DEFAULT_CATEGORIES,
    viewports: ['sm', 'md', 'lg'],
    viewportGrouping: 'separate',
    uncategorizedPosition: 'afterCategorized',
    printWidth: 40 // Small width to force wrapping
}

describe('categorizeClassesAndViewports', () => {
    test('groups classes by category', () => {
        const parsed: ClassParseResult = {
            baseClasses: ['flex', 'absolute', 'text-center', 'p-4'],
            viewportClasses: {},
            dynamicExpressions: []
        }
        
        // generic config with large printWidth to avoid wrapping
        const config = { ...mockConfig, printWidth: 100 }
        
        const lines = categorizeClassesAndViewports(parsed, config)
        
        // Expected order based on categories: Position (absolute), Layout (?), Flexbox (flex), Padding (p-4), Typography (text-center)
        // Position: absolute
        // Flexbox: flex
        // Padding: p-4
        // Typography: text-center
        
        // Check if we get separate lines or if they are grouped
        // The categorizer logic creates one line per group if it fits?
        // No, it handles groups.
        // categories.ts defines Position, Flexbox, Padding, Typography as separate top-level keys.
        // So they will be on separate lines because `categorizeTailwindClasses` iterates keys.
        
        expect(lines).toContain('absolute')
        expect(lines).toContain('flex')
        expect(lines).toContain('p-4')
        expect(lines).toContain('text-center')
        // since they are different categories, they should be on different lines
        expect(lines.length).toBeGreaterThanOrEqual(4)
    })

    test('wraps lines when exceeding printWidth', () => {
        // LayoutOverflow: overflow- overscroll- object- z-
        // Let's use classes from the SAME category
        const parsed: ClassParseResult = {
            baseClasses: ['overflow-hidden', 'overscroll-none', 'object-contain', 'z-10'],
            viewportClasses: {},
            dynamicExpressions: []
        }
        
        // width 20 is very small, should match roughly 'overflow-hidden' length
        const config = { ...mockConfig, printWidth: 20 }
        
        const lines = categorizeClassesAndViewports(parsed, config)
        
        // These are all LayoutOverflow. Same category.
        // It creates groups. All these prefixes map to LayoutOverflow.
        // So we get ONE group of classes.
        // formatCategoryLines will be called with [[classes...]]
        // It should wrap.
        
        // overflow-hidden (15 chars)
        // overscroll-none (15 chars)
        // If combined: 31 chars -> > 20 -> wrap
        
        expect(lines.length).toBeGreaterThan(1)
        expect(lines.join(' ')).toContain('overflow-hidden')
    })
    
     test('supports group* wildcard', () => {
        const parsed: ClassParseResult = {
            baseClasses: ['group-hover:flex', 'group-focus:block'],
            viewportClasses: {},
            dynamicExpressions: []
        }
        
        const config = { ...mockConfig, printWidth: 100 }
        const lines = categorizeClassesAndViewports(parsed, config)
        
        // group* is in State category.
        // All should be grouped together.
        expect(lines.length).toBe(1)
        expect(lines[0]).toContain('group-hover:flex group-focus:block')
     })
})
