import colors from 'colors/safe'

export type Colors = typeof colors

export type NormalizeVerbaStringOptions = {
  /**
   * @default false
   */
  disableColors?: boolean
}

export type VerbaString = string | ((c: Colors) => string)
