import { Colors, FancyString, NormalizeVerbaStringOptions, StringFormat, VerbaString } from './types'

import colors from 'colors/safe'

export const verbaColorizer: Colors = colors
export const verbaDecolorizer: Colors = {
  black: s => s,
  red: s => s,
  green: s => s,
  yellow: s => s,
  blue: s => s,
  magenta: s => s,
  cyan: s => s,
  white: s => s,
  gray: s => s,
  grey: s => s,
  bgBlack: s => s,
  bgRed: s => s,
  bgGreen: s => s,
  bgYellow: s => s,
  bgBlue: s => s,
  bgMagenta: s => s,
  bgCyan: s => s,
  bgWhite: s => s,
  reset: s => s,
  bold: s => s,
  dim: s => s,
  italic: s => s,
  underline: s => s,
  inverse: s => s,
  hidden: s => s,
  strikethrough: s => s,
  rainbow: s => s,
  zebra: s => s,
  america: s => s,
  trap: s => s,
  random: s => s,
  zalgo: s => s,
  disable: () => undefined,
  enable: () => undefined,
  enabled: true,
  setTheme: () => undefined,
  strip: () => '',
  stripColors: () => '',
}

export const getColorizer = (options?: NormalizeVerbaStringOptions) => (
  (options?.disableColors ?? false) ? verbaDecolorizer : verbaColorizer
)

/**
 * Normalizes the given `VerbaString` `s` to a `string`.
 */
export const normalizeVerbaString = (s: VerbaString, options?: NormalizeVerbaStringOptions): string => {
  const _colorizer = getColorizer(options)

  switch (typeof s) {
    case 'function':
      return s(_colorizer)
    case 'string':
      return s
    default:
      return s.map(_s => (typeof _s === 'string' ? _s : _s(_colorizer))).join('')
  }
}

/**
 * Creates a function that normalizes a `VerbaString`.
 * 
 * This is a performance-optimized `normalizeVerbaString` that bakes-in the colorizer.
 */
export const createVerbaStringNormalizer = (options?: NormalizeVerbaStringOptions) => {
  const _colorizer = getColorizer(options)
  return (s: VerbaString) => {
    switch (typeof s) {
      case 'function':
        return s(_colorizer)
      case 'string':
        return s
      default:
        return s.map(_s => (typeof _s === 'string' ? _s : _s(_colorizer))).join('')
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
 * Performant version of `createStringFormatter` that does some precalculation
 * to improve performance when called with many strings.
 */
export const createStringFormatter = (formats: StringFormat[], options?: NormalizeVerbaStringOptions): ((s: string) => string) => {
  if ((options?.disableColors ?? false) || formats.length === 0)
    return s => s

  const fns = formats.map(f => verbaColorizer[f])
  switch (fns.length) {
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
  return typeOfV === 'string' || typeOfV === 'function' || Array.isArray(typeOfV)
}
