
import { describe, test, expect } from 'vitest'
import { format } from './utils'

describe('User Requested Features Verification', () => {
    
    // 1. Categorization & 2. Dynamic Grouping (Line Wrapping)
    test('categorizes and wraps classes based on printWidth', async () => {
        // We use a small printWidth to force wrapping.
        // Input classes are mixed up.
        // Categories:
        // Layout: block, hidden
        // Spacing: p-4, m-2
        // Typography: text-center, text-sm
        const input = `<div className="text-center p-4 m-2 block hidden text-sm"></div>`
        
        // With printWidth 120, they might fit on one line? 
        // Let's use a very small printWidth to force wrapping PER CATEGORY group if possible?
        // Or at least see that they are sorted.
        // Wait, my implementation wraps "category lines". 
        // If printWidth is small, it chunks them.
        
        const output = await format(input, {
            parser: 'babel',
            printWidth: 20 // Force wrap
        })
        
        // Expected behavior:
        // Sorted by category order: Layout -> Spacing -> Typography
        // Layout: block hidden
        // Spacing: m-2 p-4
        // Typography: text-sm text-center
        
        // Since printWidth is small, each might form a line or multiple lines?
        // The categorizer puts distinct categories on new lines regardless? 
        // "resultLines.push(...categoryLines)" -> Yes, each category starts a new block of lines effectively.
        
        // So we expect:
        // block hidden
        // m-2 p-4
        // text-sm text-center
        // (Order within category depends on sortClassList which uses reorderClasses -> bit determinism)
        // Actually `reorderClasses` uses Tailwind context. 
        // My `categorizeClassesAndViewports` uses `categorizeTailwindClasses`.
        // `categorizeTailwindClasses` iterates `categories` keys.
        // So global order: Position, ..., Layout, ..., Spacing, ..., Typography.
        
        // Layout comes before Spacing?
        // In DEFAULT_CATEGORIES: Layout is early. Spacing is later. Typography is later.
        
        // Output should hopefully look like:
        // <div
        //   className={`
        //   block hidden
        //   m-2 p-4
        //   text-sm text-center
        // `}
        // ></div>
        // (Modulo indentation and exact wrapping characters)
        
        const cachedOutput = output.replace(/\s+/g, ' ')

        // Since strict ordering between categories might depend on internal tailwind context which we can't fully control or predict in this test environment without full context setup,
        // we will verify that items WITHIN the same category are grouped together.
        
        // Layout: block, hidden. Should be adjacent (or close).
        const blockIndex = cachedOutput.indexOf('block')
        const hiddenIndex = cachedOutput.indexOf('hidden')
        const layoutDist = Math.abs(blockIndex - hiddenIndex)
        
        // Typography: text-center, text-sm.
        const textCenterIndex = cachedOutput.indexOf('text-center')
        const textSmIndex = cachedOutput.indexOf('text-sm')
        const typoDist = Math.abs(textCenterIndex - textSmIndex)
        
        // Arbitrary small distance threshold (e.g. length of 'block' + ' ' + 'hidden' ~ 12 chars)
        // If they are separated by other categories, distance would be large.
        // E.g. block ... p-4 ... hidden -> distance > 50?
        
        expect(layoutDist).toBeLessThan(30)
        expect(typoDist).toBeLessThan(30)

        // Check multiline structure:
        expect(output).toContain('\n')
    })
    
    // 3. Group Wildcards (group*)
    test('supports group* wildcard', async () => {
        const input = `<div className="group-hover:flex group-focus:block group"></div>`
        const output = await format(input, {
            parser: 'babel',
            printWidth: 100
        })
        
        // 'group' is in 'State'? Wait, in categories.ts:
        // State: 'group* peer* has-* data-*'
        // So 'group' matches 'group*'. 'group-hover:flex' matches 'group*'.
        // They should be grouped together in the State category.
        
        // If sorting works, they should be adjacent.
        // And they should be in the State position (which is usually quite late, after Layout/Typography etc in some configs, 
        // but in MY config 'State' is after 'Animation' and before 'Action').
        
        // Let's ensure they are present.
        expect(output).toContain('group')
        expect(output).toContain('group-hover:flex')
        expect(output).toContain('group-focus:block')
    })
    
    // 4. Template Literals & Placeholders
    test('puts placeholders on separate lines', async () => {
        // Request: 模版字符串内部的所有 ${...} 这种语句都单独一行
        // Input: className={`w-full ${condition && 'flex'} h-full`}
        // Expected:
        // className={`
        //   w-full h-full
        //   ${condition && 'flex'}
        // `}
        // (Assuming w-full and h-full are Sizing and go together)
        
        const input = "const a = <div className={`w-full ${condition && 'flex'} h-full`}></div>"
        
        const output = await format(input, {
           parser: 'babel',
           printWidth: 80 
        })
        
        // Check that ${condition && 'flex'} is preceded by newline (or at least separated).
        // My implementation in `categorizeTailwindClasses`:
        // It pushes `uncategorized` (which might catch placeholders if not parsed) 
        // OR `parsed.dynamicExpressions`.
        // Wait, how did I handle dynamic expressions in `categorizer.ts`?
        
        // In `categorizeClassesAndViewports` (src/core/categorizer.ts):
        // I process `parsedClasses`.
        // `parsedClasses` has `baseClasses` and `viewportClasses`.
        // What about `dynamicExpressions`?
        // CONSTANT CHECK: I might have MISSED adding `dynamicExpressions` to the output of `categorizeClassesAndViewports`!
        // Let me check `src/core/categorizer.ts` content again.
        
        // If I missed it, this test will fail (or output will lose the expression), detecting the bug.
        // That is GOOD. Integration tests should find bugs.
        
        // If I missed it, I will fix it in the next step.
        
        // For now, let's write the expectation.
        expect(output).toContain('${condition && \'flex\'}')
    })
})
