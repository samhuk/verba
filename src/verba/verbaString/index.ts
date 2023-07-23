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

/**
 * Normalizes the given `VerbaString` `s` to a `string`.
 */
export const normalizeVerbaString = (s: VerbaString, options?: NormalizeVerbaStringOptions): string => {
  const _colorizer = (options?.disableColors ?? false) ? verbaDecolorizer : verbaColorizer

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
 * Renders the given `FancyString` `s` to a `string`
 */
export const renderFancyString = (s: FancyString, options?: NormalizeVerbaStringOptions): string => (
  s((options?.disableColors ?? false) ? verbaDecolorizer : verbaColorizer)
)

/**
 * Renders the given string `s` with the given `formats`.
 * 
 * @example
 * const formattedString = renderStringWithFormats('foo', 'white', 'bold', 'underline')
 */
export const renderStringWithFormats = (s: string, ...formats: StringFormat[]) => (
  renderFancyString(c => formats.reduce((acc, f) => c[f](acc), s))
)

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
