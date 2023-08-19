import { VerbaBaseOutlets } from '../types'

export type Aliases<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  [outletName: string]: (baseOutlets: VerbaBaseOutlets<TCode, TData>) => (...args: any[]) => any
}
