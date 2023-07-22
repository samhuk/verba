import colors from 'colors/safe'

export type Colors = typeof colors

export type NormalizeVerbaStringOptions = {
  /**
   * @default false
   */
  disableColors?: boolean
}

export type FancyString = (c: Colors) => string

export type VerbaString = string | FancyString | (string | FancyString)[]

export type StringFormat = Exclude<
  keyof Colors,
  'disable'
  | 'enable'
  | 'enabled'
  | 'setTheme'
  | 'strip'
  | 'stripColors'
>
