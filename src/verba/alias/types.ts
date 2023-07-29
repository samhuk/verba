import { VerbaLoggerBaseOutlets } from '../types'

export type Aliases<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  [outletName: string]: (baseOutlets: VerbaLoggerBaseOutlets<TCode, TData>) => (...args: any[]) => any
}
