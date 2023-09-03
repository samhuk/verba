import { Outlet, OutletToNormalizedArgsObj } from '../outlet/types'

import { TypeDependantBaseIntersection } from '../util/types'

export type OutletFilterOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
  TOutlet extends Outlet = Outlet,
> = TypeDependantBaseIntersection<
  Outlet,
  OutletToNormalizedArgsObj<TCode, TData>,
  TOutlet,
  'outlet'
>

export type OutletFilter<
  TCode extends string | number = string | number,
  TData extends any = any,
> = (options: OutletFilterOptions<TCode, TData>) => boolean
