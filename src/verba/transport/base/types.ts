import { NormalizedSimpleOutletOptions, SimpleOutlet } from '../../outlet/types'

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
}
