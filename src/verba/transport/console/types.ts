import { BaseTransportOptions } from '../base/types'

export type ConsoleTransportOptions<
  TCode extends string | number = string | number,
  TData extends any = any
> = Partial<
  Pick<
    BaseTransportOptions<TCode, TData>,
    'dispatchDeltaT' | 'outletPrefixes' | 'simpleOutletOverrides' | 'dispatchTimePrefix' | 'disableColors'
  >
>
