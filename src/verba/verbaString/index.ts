import { FancyString, NormalizeVerbaStringOptions, StringFormat, VerbaColor, VerbaColorizer, VerbaString } from './types'

import kleur from 'kleur'

export const verbaColorizer: VerbaColorizer = kleur

let verbaDecolorizerInternal: VerbaColorizer

const mockKleurColorizer: VerbaColor = (...args: any[]) => {
  if (args[0] == null)
    return verbaDecolorizerInternal as any

  return String(args[0]) as any
}

export const verbaDecolorizer: VerbaColorizer = {
  black: mockKleurColorizer,
  red: mockKleurColorizer,
  green: mockKleurColorizer,
  yellow: mockKleurColorizer,
  blue: mockKleurColorizer,
  magenta: mockKleurColorizer,
  cyan: mockKleurColorizer,
  white: mockKleurColorizer,
  gray: mockKleurColorizer,
  grey: mockKleurColorizer,
  bgBlack: mockKleurColorizer,
  bgRed: mockKleurColorizer,
  bgGreen: mockKleurColorizer,
  bgYellow: mockKleurColorizer,
  bgBlue: mockKleurColorizer,
  bgMagenta: mockKleurColorizer,
  bgCyan: mockKleurColorizer,
  bgWhite: mockKleurColorizer,
  bold: mockKleurColorizer,
  dim: mockKleurColorizer,
  italic: mockKleurColorizer,
  underline: mockKleurColorizer,
  inverse: mockKleurColorizer,
  hidden: mockKleurColorizer,
  strikethrough: mockKleurColorizer,
  reset: mockKleurColorizer,
}

verbaDecolorizerInternal = verbaDecolorizer

export const getColorizer = (options?: NormalizeVerbaStringOptions) => (
  (options?.disableColors ?? false) ? verbaDecolorizer : verbaColorizer
)

/**
 * Normalizes the given `VerbaString` `str` to a `string`.
 */
export const normalizeVerbaString = (str: VerbaString, options?: NormalizeVerbaStringOptions): string => {
  const colorizer = getColorizer(options)

  switch (typeof str) {
    case 'function':
      return str(colorizer)
    case 'string':
      return str
    default:
      return str.map(s => (typeof s === 'string' ? s : s(colorizer))).join('')
  }
}

/**
 * Creates a function that normalizes a `VerbaString`.
 * 
 * This is a performance-optimized `normalizeVerbaString` that bakes-in the colorizer.
 */
export const createVerbaStringNormalizer = (options?: NormalizeVerbaStringOptions) => {
  const colorizer = getColorizer(options)

  return (str: VerbaString) => {
    switch (typeof str) {
      case 'function':
        return str(colorizer)
      case 'string':
        return str
      default:
        return str.map(s => (typeof s === 'string' ? s : s(colorizer))).join('')
    }
  }
}

/**
 * Renders the given `FancyString` `s` to a `string`
 */
export const renderFancyString = (s: FancyString, options?: NormalizeVerbaStringOptions): string => (
  s(getColorizer(options))
)

/**
 * Renders the given string `s` with the given `formats`.
 * 
 * @example
 * const formattedString = renderStringWithFormats('foo', ['white', 'bold', 'underline'])
 */
export const renderStringWithFormats = (s: string, formats: StringFormat[], options?: NormalizeVerbaStringOptions) => {
  const _colorizer = getColorizer(options)
  return formats.reduce((acc, format) => _colorizer[format](acc), s)
}

/**
 * Performant version of `renderStringWithFormats` that does some precalculation
 * to improve performance when called with many strings.
 */
export const createStringFormatter = (formats: StringFormat[], options?: NormalizeVerbaStringOptions): ((s: string) => string) => {
  if ((options?.disableColors ?? false) || formats.length === 0)
    return s => s

  const fns = formats.map(f => verbaColorizer[f])
  switch (fns.length) {
    case 0:
      return s => s
    case 1: {
      const f1 = fns[0]
      return s => f1(s)
    }
    case 2: {
      const f1 = fns[0]
      const f2 = fns[1]
      return s => f2(f1(s))
    }
    case 3: {
      const f1 = fns[0]
      const f2 = fns[1]
      const f3 = fns[2]
      return s => f3(f2(f1(s)))
    }
    case 4: {
      const f1 = fns[0]
      const f2 = fns[1]
      const f3 = fns[2]
      const f4 = fns[3]
      return s => f4(f3(f2(f1(s))))
    }
    default:
      return s => formats.reduce((acc, format) => verbaColorizer[format](acc), s)
  }
}

/**
 * Determines if the given `value` represents a `VerbaString`, i.e. a `string`,
 * `function`, or `(string | function)[]`.
 * 
 * Note that the above types are not very unique, therefore be cautious about
 * what other types that `value` could be.
 */
export const isVerbaString = (value: unknown): value is VerbaString => {
  const typeOfV = typeof value
  return typeOfV === 'string' || typeOfV === 'function' || Array.isArray(value)
}
