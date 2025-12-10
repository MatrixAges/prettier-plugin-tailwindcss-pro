import type { ParserOptions } from 'prettier'

export interface FormatterConfig {
	categories: Record<string, string>
	viewports: string[]
	viewportGrouping: 'separate' | 'separate-categorized' | 'inline'
	uncategorizedPosition: 'beforeCategorized' | 'afterCategorized'
	printWidth?: number
    usesTabs?: boolean
    tabSize?: number
	// Prettier native options that might be passed down
	prettierConfig?: ParserOptions
	// Babel config if needed (likely just placeholder for now as we use standard babel parsing)
	babelConfig?: any
}

export interface ClassParseResult {
	baseClasses: string[]
	viewportClasses: Record<string, string[]>
	dynamicExpressions: string[]
}

export interface PrefixInfo {
	category: string
	prefix: string
	length: number
}
