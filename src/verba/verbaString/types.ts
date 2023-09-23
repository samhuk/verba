import colors from 'colors/safe'

type ExcludedColorsProps = 'disable'
  | 'enable'
  | 'enabled'
  | 'setTheme'
  | 'reset'
  | 'strip'
  | 'stripColors'
  | 'zalgo'
  | 'trap'
  | 'america'
  | 'random'
  | 'zebra'
  | 'rainbow'

export type Colors = Omit<typeof colors, ExcludedColorsProps>

export type NormalizeVerbaStringOptions = {
  /**
   * @default false
   */
  disableColors?: boolean
}

/**
 * A string that can be formatted with the `colors` package.
 */
export type FancyString = (c: Colors) => string

/**
 * A string that can optionally be formatted (with the `colors` package).
 * 
 * @example
 * 'foo bar'
 * f => `${f.blue('foo')} bar`
 * ['foo', f => `${f.blue('foo')} bar`]
 */
export type VerbaString = string | FancyString | (string | FancyString)[]

/**
 * The available string formats. Note that not all of these are widely supported,
 * such as italic, underline, etc.
 */
export type StringFormat = keyof Colors
