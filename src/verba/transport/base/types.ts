import { NormalizedSimpleOutletOptions, SimpleOutlet, SimpleOutletPrefixesOptions } from '../../outlet/types'

/**
 * A type that represents an entity that is occupying the current (TTY) console output.
 * 
 * This could be a progress bar, a spinner, etc.
 */
export type TtyConsoleOccupier = {
  onInterruptedByOtherLog: () => void
  destroy: () => void
}

/**
 * Overrides the logging behavior of simple outlets
 */
export type SimpleOutletOverride<
  TCode extends string | number = string | number,
  TData extends any = any
> = (options: NormalizedSimpleOutletOptions<TCode, TData>) => string | false

export type BaseTransportOptions<
  TCode extends string | number = string | number,
  TData extends any = any
> = {
  dispatch: (s: string) => void
  isTty: boolean
  disableColors?: boolean
  simpleOutletOverrides?: Partial<{ [outlet in SimpleOutlet]: SimpleOutletOverride<TCode, TData> }>
  outletPrefixes?: SimpleOutletPrefixesOptions
}
