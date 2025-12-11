import { describe, test } from 'vitest'
import { readFile } from 'node:fs/promises'
import { format } from './utils.js'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('useTailwindFormat', () => {
  test('multiple categories formatting', async ({ expect }) => {
    const sourceFile = path.join(__dirname, 'categories/multiple-categories/multiple-categories.tsx')
    const expectedFile = path.join(__dirname, 'categories/multiple-categories/multiple-categories.expected.tsx')

    const source = await readFile(sourceFile, 'utf-8')
    const expected = await readFile(expectedFile, 'utf-8')

    const result = await format(source, {
      parser: 'typescript',
      useTailwindFormat: true,
      tabWidth: 6,
    })

    expect(result).toEqual(expected.trim())
  })

  test('custom categories formatting', async ({ expect }) => {
    const sourceFile = path.join(__dirname, 'categories/custom-categories/custom-categories.tsx')
    const expectedFile = path.join(__dirname, 'categories/custom-categories/custom-categories.expected.tsx')

    const source = await readFile(sourceFile, 'utf-8')
    const expected = await readFile(expectedFile, 'utf-8')

    const result = await format(source, {
      parser: 'typescript',
      useTailwindFormat: true,
      tabWidth: 6,
      useTailwindFormatCategories: path.join(__dirname, 'categories/custom-categories/tailwind-format-categories.json'),
    })

    expect(result).toEqual(expected.trim())
  })

  test('template string formatting', async ({ expect }) => {
    const sourceFile = path.join(__dirname, 'categories/template-string/template-string.tsx')
    const expectedFile = path.join(__dirname, 'categories/template-string/template-string.expected.tsx')

    const source = await readFile(sourceFile, 'utf-8')
    const expected = await readFile(expectedFile, 'utf-8')

    const result = await format(source, {
      parser: 'typescript',
      useTailwindFormat: true,
      tabWidth: 6,
    })

    expect(result).toEqual(expected.trim())
  })

  test('dynamic line wrapping with printWidth', async ({ expect }) => {
    const sourceFile = path.join(__dirname, 'categories/dynamic-wrapping/dynamic-wrapping.tsx')
    const expectedFile = path.join(__dirname, 'categories/dynamic-wrapping/dynamic-wrapping.expected.tsx')

    const source = await readFile(sourceFile, 'utf-8')
    const expected = await readFile(expectedFile, 'utf-8')

    const result = await format(source, {
      parser: 'typescript',
      useTailwindFormat: true,
      printWidth: 80,
      tabWidth: 6,
    })

    expect(result).toEqual(expected.trim())
  })

  test('fn-in-class formatting', async ({ expect }) => {
    const sourceFile = path.join(__dirname, 'categories/fn-in-class/fn-in-class.tsx')
    const expectedFile = path.join(__dirname, 'categories/fn-in-class/fn-in-class.expected.tsx')

    const source = await readFile(sourceFile, 'utf-8')
    const expected = await readFile(expectedFile, 'utf-8')

    const result = await format(source, {
      parser: 'typescript',
      useTailwindFormat: true,
      tabWidth: 6,
      printWidth: 80,
      singleQuote: false,
      useTailwindFormatCategories: path.join(__dirname, 'categories/custom-categories/tailwind-format-categories.json'),
    })

    expect(result).toEqual(expected.trim())
  })
})

