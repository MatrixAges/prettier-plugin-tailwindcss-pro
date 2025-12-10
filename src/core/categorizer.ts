import type { ClassParseResult, FormatterConfig, PrefixInfo } from './types'

/**
 * Categorizes classes and viewports according to viewport grouping configuration.
 * Handles both separate and inline viewport grouping modes.
 */
export function categorizeClassesAndViewports(
	parsedClasses: ClassParseResult,
	formatterConfig: FormatterConfig
): string[] {
	switch (formatterConfig.viewportGrouping) {
		case 'separate':
			return categorizeSeparateMode(parsedClasses, formatterConfig)
		case 'separate-categorized':
			return categorizeSeparateCategorizedMode(parsedClasses, formatterConfig)
		case 'inline':
			return categorizeInlineMode(parsedClasses, formatterConfig)
		default:
			// Default to separate if unknown
			return categorizeSeparateMode(parsedClasses, formatterConfig)
	}
}

function categorizeSeparateMode(
	parsedClasses: ClassParseResult,
	formatterConfig: FormatterConfig,
	categorized: boolean = false
): string[] {
	const categorizedResult: string[] = []

	const baseClassCategories = categorizeTailwindClasses(parsedClasses.baseClasses, formatterConfig)

	if (baseClassCategories) {
		categorizedResult.push(...baseClassCategories)
	}

	formatterConfig.viewports.forEach(viewport => {
		if (parsedClasses.viewportClasses[viewport]?.length > 0) {
			const prefixedClasses = parsedClasses.viewportClasses[viewport].map(cls => `${viewport}:${cls}`)

			const viewportCategories = categorizeTailwindClasses(prefixedClasses, formatterConfig)

			if (viewportCategories.length > 0) {
				if (categorized) {
					categorizedResult.push(...viewportCategories)
				} else {
					categorizedResult.push(viewportCategories.join(' '))
				}
			}
		}
	})

    // Append dynamic expressions on their own lines
    if (parsedClasses.dynamicExpressions.length > 0) {
        categorizedResult.push(...parsedClasses.dynamicExpressions)
    }

	return categorizedResult
}

function categorizeSeparateCategorizedMode(
	parsedClasses: ClassParseResult,
	formatterConfig: FormatterConfig
): string[] {
	return categorizeSeparateMode(parsedClasses, formatterConfig, true)
}

function categorizeInlineMode(parsedClasses: ClassParseResult, formatterConfig: FormatterConfig): string[] {
	const allClasses: string[] = [...parsedClasses.baseClasses]

	formatterConfig.viewports.forEach(viewport => {
		if (parsedClasses.viewportClasses[viewport]?.length > 0) {
			allClasses.push(...parsedClasses.viewportClasses[viewport].map(cls => `${viewport}:${cls}`))
		}
	})

	return categorizeTailwindClasses(allClasses, formatterConfig)
}

/**
 * Categorizes Tailwind CSS classes into groups based on their prefixes.
 * Supports wildcard prefixes (e.g., 'group*') and dynamic wrapping based on printWidth.
 */
export function categorizeTailwindClasses(classes: string[], formatterConfig: FormatterConfig): string[] {
	const { categories, viewports, uncategorizedPosition, printWidth = 80 } = formatterConfig

	// Structure: Category -> Prefix -> Classes[]
	// Using generic object for map since categories are dynamic strings
	const categorizedGroups: Record<string, Map<string, string[]>> = {}
	const uncategorized: string[] = []

	if (classes.length === 0) {
		return []
	}

	// Initialize map
	// If categories is empty, treat all as uncategorized (though caller might handle empty categories check)
	if (Object.keys(categories).length > 0) {
		Object.keys(categories).forEach(category => {
			categorizedGroups[category] = new Map()
		})
	}

	// Map for all prefixes
	const allPrefixes: PrefixInfo[] = []

	Object.entries(categories).forEach(([category, prefixesString]) => {
		const prefixes = prefixesString.split(' ')
		prefixes.forEach(rawPrefix => {
			// Support group* syntax
			const isWildcard = rawPrefix.endsWith('*')
			const prefix = isWildcard ? rawPrefix.slice(0, -1) : rawPrefix

			allPrefixes.push({
				category,
				prefix,
				length: prefix.length
			})

			// Use rawPrefix as the key for grouping to respect the config structure
			if (!categorizedGroups[category].has(rawPrefix)) {
				categorizedGroups[category].set(rawPrefix, [])
			}
		})
	})

	// Sort prefixes by length in descending order (most specific first)
	allPrefixes.sort((a, b) => b.length - a.length)

	// Process each class
	classes.forEach(cls => {
		let matched = false
		let classToCheck = cls

		// Handle viewport prefixes for matching logic
		// We only strip viewport if we are looking for the "base" utility type
		const viewportPrefix = viewports.find(vp => cls.startsWith(`${vp}:`))
		if (viewportPrefix) {
			classToCheck = cls.substring(viewportPrefix.length + 1)
		}

		// Simple interpolation handling: split by ${ to match the static part prefix
		const classBeforeInterpolation = classToCheck.split('${')[0]

		// Find the most specific match
		for (const { category, prefix } of allPrefixes) {
			if (classBeforeInterpolation.startsWith(prefix)) {
				// Find the raw key (potentially with wildcard) from configuration
				const entries = Object.entries(categories).find(([c]) => c === category)
				if (entries) {
					const rawPrefixes = entries[1].split(' ')
					const targetRaw = rawPrefixes.find(
						r => r === prefix || (r.endsWith('*') && r.slice(0, -1) === prefix)
					)

					if (targetRaw) {
						const group = categorizedGroups[category].get(targetRaw)
						if (group) {
							group.push(cls)
							matched = true
						}
					}
				}
				break
			}
		}

		if (!matched) {
			uncategorized.push(cls)
		}
	})

	// Formatting and Line Wrapping Logic
	const resultLines: string[] = []

	Object.keys(categories).forEach(category => {
		const groupsMap = categorizedGroups[category]
		const groups: string[][] = []

		if (groupsMap) {
			groupsMap.forEach(groupClasses => {
				if (groupClasses.length > 0) {
					groups.push(groupClasses)
				}
			})
		}

		if (groups.length > 0) {
			const categoryLines = formatCategoryLines(groups, printWidth)
			resultLines.push(...categoryLines)
		}
	})

	const uncategorizedString = uncategorized.join(' ')

	if (uncategorizedPosition === 'beforeCategorized' && uncategorizedString) {
		return [uncategorizedString, ...resultLines]
	} else if (uncategorizedString) {
		return [...resultLines, uncategorizedString]
	}

	return resultLines
}

/**
 * Helper function to format groups into lines respecting printWidth.
 */
function formatCategoryLines(groups: string[][], printWidth: number): string[] {
	const lines: string[] = []
	let remainingGroups = [...groups]

	while (remainingGroups.length > 0) {
		let currentLineGroups = [...remainingGroups]
		// Join with space, calculate length. Note: indentation is not accounted for here,
		// which is a simplified approximation common in this context.
		// Detailed indent handling usually happens at the printer layer.
		let currentLineString = currentLineGroups.map(g => g.join(' ')).join(' ')

		// While line is too long AND we have more than one group (so we can break it)
		while (currentLineString.length > printWidth && currentLineGroups.length > 1) {
			currentLineGroups.pop()
			currentLineString = currentLineGroups.map(g => g.join(' ')).join(' ')
		}

		lines.push(currentLineString)
		remainingGroups = remainingGroups.slice(currentLineGroups.length)
	}

	return lines
}
