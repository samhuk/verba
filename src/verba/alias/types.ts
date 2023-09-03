import { Outlet } from '../outlet/types'
import { VerbaBaseOutlets } from '../types'

export type Alias<
  TCode extends string | number = string | number,
  TData extends any = any,
> = ((baseOutlets: VerbaBaseOutlets<TCode, TData>) => (...args: any[]) => any) | false

export type Aliases<
  TCode extends string | number = string | number,
  TData extends any = any,
> = Partial<Record<Outlet, Alias<TCode, TData>>> & {
  [customOutletName: string]: Alias<TCode, TData>
}
