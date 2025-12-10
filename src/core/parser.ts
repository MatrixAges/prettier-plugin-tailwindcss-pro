import * as t from '@babel/types'
import type { ClassParseResult } from './types'

/**
 * Parses Tailwind CSS classes from a JSX/TSX class/className attribute.
 * Separates static classes from dynamic expressions for proper formatting.
 */
export function parseTailwindClassesWithBabel(
	classNameNode: t.JSXAttribute | t.StringLiteral | t.Expression,
	sourceText: string,
	categories: Record<string, string>,
	viewports: string[]
): ClassParseResult {
    sourceText = sourceText || ''
	const parsedClasses: ClassParseResult = {
		baseClasses: [],
		viewportClasses: {},
		dynamicExpressions: []
	}
	viewports.forEach(viewport => {
		parsedClasses.viewportClasses[viewport] = []
	})

	let classNameValue: t.Node | null = null

	if (t.isJSXAttribute(classNameNode)) {
		classNameValue = classNameNode.value || null
	} else {
		classNameValue = classNameNode
	}

	if (t.isStringLiteral(classNameValue)) {
		const classNameString = classNameValue.value
		processTailwindClasses(classNameString, parsedClasses, viewports)
		return parsedClasses
	}

	if (t.isJSXExpressionContainer(classNameValue)) {
		const expression = classNameValue.expression
		// Recursive helper could be better, but we stick to the provided structure
		// wrapping the expression handling logic
		handleExpression(expression, sourceText, parsedClasses, categories, viewports)
	} else if (t.isExpression(classNameValue)) {
		// Handle case where we passed an expression directly (e.g. from TemplateLiteral processing or recursive calls)
		handleExpression(classNameValue, sourceText, parsedClasses, categories, viewports)
	}

	return parsedClasses
}

function handleExpression(
	expression: t.Expression | t.JSXEmptyExpression,
	sourceText: string,
	parsedClasses: ClassParseResult,
	categories: Record<string, string>,
	viewports: string[]
) {
	if (t.isStringLiteral(expression)) {
		processTailwindClasses(expression.value, parsedClasses, viewports)
		return
	}

	// Get raw text of the expression
	const expressionText =
		expression.start && expression.end ? sourceText.slice(expression.start, expression.end) : ''

	if (t.isCallExpression(expression) && t.isIdentifier(expression.callee)) {
		// e.g. clsx('...')
		expression.arguments.forEach(arg => {
			if (t.isStringLiteral(arg)) {
				processTailwindClasses(arg.value, parsedClasses, viewports)
			} else if (t.isConditionalExpression(arg)) {
				handleConditional(arg, sourceText, parsedClasses, categories, viewports)
                // Also add the full expression as dynamic because we can't fully extract static parts safely for sorting
                // usually without modifying the AST structure significantly.
                // But the requirement says "separate static classes from dynamic".
                // In `clsx(condition ? 'a' : 'b')`, 'a' and 'b' are static in their branches.
                // For now, we follow the provided logic: extract potential static parts for analysis?
                // Actually the provided reference code pushes the source text to dynamicExpressions
                // AND processes static parts.
				parsedClasses.dynamicExpressions.push(
					arg.start && arg.end ? sourceText.slice(arg.start, arg.end) : ''
				)
			} else {
                 if (arg.start && arg.end) {
				    parsedClasses.dynamicExpressions.push(sourceText.slice(arg.start, arg.end))
                 }
			}
		})
	} else if (t.isTemplateLiteral(expression)) {
		processTemplateLiteral(expression, sourceText, parsedClasses, categories, viewports)
	} else if (t.isConditionalExpression(expression)) {
		handleConditional(expression, sourceText, parsedClasses, categories, viewports)
		parsedClasses.dynamicExpressions.push(`\${${expressionText}}`)
	} else if (hasTailwindPrefix(expressionText, categories)) {
		// If the entire expression looks like a tailwind class (unlikely for complex expressions, but possible for identifiers if they match)
		processTailwindClasses(expressionText, parsedClasses, viewports)
	} else {
		// Fallback for unknown dynamic expressions
		if (expressionText) {
			parsedClasses.dynamicExpressions.push(expressionText) // Or usually `${expressionText}` depending on context
		}
	}
}

function handleConditional(
	expression: t.ConditionalExpression,
	sourceText: string,
	parsedClasses: ClassParseResult,
	categories: Record<string, string>,
	viewports: string[]
) {
	if (t.isStringLiteral(expression.consequent)) {
		processTailwindClasses(expression.consequent.value, parsedClasses, viewports)
	}
	if (t.isStringLiteral(expression.alternate)) {
		processTailwindClasses(expression.alternate.value, parsedClasses, viewports)
	}
}

function hasTailwindPrefix(classString: string, categories: Record<string, string>): boolean {
	// Quick check: does it look like any of the prefixes?
	// Note: Providing categories is essential here.
	for (const [_, prefixString] of Object.entries(categories)) {
		const prefixes = prefixString.split(' ')
		for (const prefix of prefixes) {
			const cleanPrefix = prefix.endsWith('*') ? prefix.slice(0, -1) : prefix
			if (classString.startsWith(cleanPrefix)) {
				return true
			}
		}
	}
	return false
}

function processTailwindClasses(
	classNameString: string,
	parsedClasses: ClassParseResult,
	viewports: string[]
): void {
	const classes = classNameString.split(/\s+/).filter(Boolean)

	classes.forEach(cls => {
		const viewportPrefix = viewports.find(v => cls.startsWith(`${v}:`))

		if (viewportPrefix) {
			const baseClass = cls.slice(viewportPrefix.length + 1)
			parsedClasses.viewportClasses[viewportPrefix].push(baseClass)
		} else {
			parsedClasses.baseClasses.push(cls)
		}
	})
}

function processTemplateLiteral(
	templateLiteral: t.TemplateLiteral,
	sourceText: string,
	parsedClasses: ClassParseResult,
	categories: Record<string, string>,
	viewports: string[]
): void {
	let currentClass = ''

	templateLiteral.quasis.forEach((quasi, index) => {
		const quasiText = quasi.value.raw
		currentClass += quasiText

		// Check if an expression follows this quasi
		if (index < templateLiteral.expressions.length) {
			const expression = templateLiteral.expressions[index]
			const expressionText =
				expression.start && expression.end ? sourceText.slice(expression.start, expression.end) : ''

			if (currentClass.trim()) { // Trim before processing
				processTailwindClasses(currentClass.trim(), parsedClasses, viewports)
			}

			parsedClasses.dynamicExpressions.push(`\${${expressionText}}`)
		}

		const isLastQuasi = index === templateLiteral.quasis.length - 1
		if (quasiText.endsWith(' ') || isLastQuasi) {
			currentClass = currentClass.trim()

			if (currentClass.includes('${')) {
				const textBeforeInterpolation = currentClass.split('${')[0]
				if (hasTailwindPrefix(textBeforeInterpolation, categories)) {
					processTailwindClasses(currentClass, parsedClasses, viewports)
				} else {
					parsedClasses.dynamicExpressions.push(currentClass)
				}
			} else {
				if (currentClass) {
					processTailwindClasses(currentClass, parsedClasses, viewports)
				}
			}
			currentClass = ''
		}
	})
}
