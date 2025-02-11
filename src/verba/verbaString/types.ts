import { Color, Kleur } from 'kleur'

export type VerbaColor = Color

export type VerbaColorizer = Kleur

export type NormalizeVerbaStringOptions = {
  /**
   * @default false
   */
  disableColors?: boolean
}

/**
 * A string that can be formatted with the `kleur` package.
 */
export type FancyString = (c: VerbaColorizer) => string

/**
 * A string that can optionally be formatted (with the `kleur` package).
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
export type StringFormat = keyof VerbaColorizer
