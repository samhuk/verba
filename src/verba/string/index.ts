import { Colors, NormalizeVerbaStringOptions, VerbaString } from './types'

import colors from 'colors/safe'

const colorizer: Colors = colors
const decolorizer: Colors = {
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
  disable: undefined,
  enable: undefined,
  enabled: undefined,
  setTheme: undefined,
  strip: undefined,
  stripColors: undefined,
}

export const normalizeVerbaString = (s: VerbaString, options?: NormalizeVerbaStringOptions): string => {
  const disableColors = options?.disableColors ?? false
  const processor = disableColors ? decolorizer : colorizer

  return typeof s === 'function'
    ? s(processor)
    : s
}
