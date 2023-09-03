import { ProgressBarOptions as BaseProgressBarOptions } from '../progressBar/types'
import { SpinnerOptions as BaseSpinnerOptions } from '../spinner/types'
import { GlobalOptions as ColumifyOptions } from 'columnify'
import { VerbaString } from '../verbaString/types'
import { OutletToTransportHandlerFn } from '../transport/types'

export enum Outlet {
  LOG = 'log',
  // Simple outlets
  INFO = 'info',
  STEP = 'step',
  SUCCESS = 'success',
  WARN = 'warn',
  ERROR = 'error',
  // Other outlets
  TABLE = 'table',
  JSON = 'json',
  DIVIDER = 'divider',
  SPACER = 'spacer',
  SPINNER = 'spinner',
  PROGRESS_BAR = 'progressBar'
}

export type SimpleOutlet = Outlet.INFO | Outlet.STEP | Outlet.SUCCESS | Outlet.WARN | Outlet.ERROR

export type ReturnlessOutlet = keyof { [TOutlet in Outlet as ReturnType<OutletToTransportHandlerFn[TOutlet]> extends void
  ? TOutlet
  : never]: 1 }

export type ReturnfulOutlet = keyof { [TOutlet in Outlet as ReturnType<OutletToTransportHandlerFn[TOutlet]> extends void
  ? never
  : TOutlet]: 1 }

export type SimpleOutletPrefixesOptions = Partial<Record<SimpleOutlet, VerbaString>>

export type SimpleOutletPrefixes = Record<SimpleOutlet, string>

export type BaseOutletOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * Optional data to associate with the log message.
   */
  data?: TData
  /**
   * Optional code to describe the area of the app that the log message is about.
   * 
   * @example
   * 'INIT'
   * 'CONNECT_DB'
   * 'USER_AUTHENTICATE'
   */
  code?: TCode
}

export type BaseNormalizedOutletOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * Data associated with the log message.
   */
  data: TData | undefined
  /**
   * Log code of the log message.
   */
  code: TCode | undefined
}

export type SimpleOutletOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = VerbaString | (BaseOutletOptions<TCode, TData> & {
  /**
   * The log message.
   * 
   * @example
   * '5 users found'
   * f => `${f.yellow('5')} users found`
   */
  msg: VerbaString
})

export type NormalizedSimpleOutletOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = BaseNormalizedOutletOptions<TCode, TData> & {
  /**
   * The log message.
   */
  msg: VerbaString
}

export type JsonOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = BaseOutletOptions<TCode, TData> & {
  /**
   * If `true`, the output JSON will be indented as per `JSON.stringify({ ... }, null, 2)`.
   * 
   * @default false
   */
  pretty?: boolean
}

export type NormalizedJsonOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = BaseNormalizedOutletOptions<TCode, TData> & {
  /**
   * If `true`, the output JSON will be indented as per `JSON.stringify({ ... }, null, 2)`.
   */
  pretty: boolean
}

export type TableOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = ColumifyOptions & BaseOutletOptions<TCode, TData>

export type NormalizedTableOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = ColumifyOptions & BaseNormalizedOutletOptions<TCode, TData>
/**
 * Options for `spacer` log calls. This can take either an integer value
 * to denote the number of lines, or an object to provide more information.
 * 
 * @default 1
 */
export type SpacerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = number | (BaseOutletOptions<TCode, TData> & {
  /**
   * The number of lines.
   * 
   * @default 1
   */
  numLines?: number
})

export type NormalizedSpacerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = BaseNormalizedOutletOptions<TCode, TData> & {
  /**
   * The number of lines.
   */
  numLines: number
}

export type DividerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = BaseOutletOptions<TCode, TData>

export type NormalizedDividerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = BaseNormalizedOutletOptions<TCode, TData>

export type SpinnerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = (
  Pick<BaseSpinnerOptions, 'text' | 'color' | 'spinner' | 'disableAutoStart'> & {
    /**
     * If `true`, this will cause the initial text defined for the spinner
     * to be persisted once upon it being interrupted by another different
     * log call whilst it is active (spinning).
     * 
     * @default true
     */
    persistInitialTextAsStepLogUponOtherLog?: boolean
  } & BaseOutletOptions<TCode, TData>
) | VerbaString

export type NormalizedSpinnerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = Required<Pick<BaseSpinnerOptions, 'text' | 'color' | 'spinner' | 'disableAutoStart'>> & {
  /**
   * If `true`, this will cause the initial text defined for the spinner
   * to be persisted once upon it being interrupted by another different
   * log call whilst it is active (spinning).
   * 
   * @default true
   */
  persistInitialTextAsStepLogUponOtherLog?: boolean
} & BaseNormalizedOutletOptions<TCode, TData>

export type ProgressBarOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = Pick<BaseProgressBarOptions, 'total' | 'barLength'> & BaseOutletOptions<TCode, TData>

export type NormalizedProgressBarOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = Required<Pick<BaseProgressBarOptions, 'total' | 'barLength'>> & BaseNormalizedOutletOptions<TCode, TData>

export type OutletToNormalizedArgsObj<
  TCode extends string | number = string | number,
  TData extends any = any
> = {
  [Outlet.LOG]: { options: NormalizedSimpleOutletOptions<TCode, TData> },
  // -- Simple outlets
  [Outlet.INFO]: { options: NormalizedSimpleOutletOptions<TCode, TData> },
  [Outlet.STEP]: { options: NormalizedSimpleOutletOptions<TCode, TData> },
  [Outlet.SUCCESS]: { options: NormalizedSimpleOutletOptions<TCode, TData> },
  [Outlet.WARN]: { options: NormalizedSimpleOutletOptions<TCode, TData> },
  [Outlet.ERROR]: { options: NormalizedSimpleOutletOptions<TCode, TData> },
  // -- Other outlets
  [Outlet.TABLE]: { data: any, options: NormalizedTableOptions<TCode, TData> },
  [Outlet.JSON]: { value: any, options: NormalizedJsonOptions<TCode, TData> },
  [Outlet.DIVIDER]: { options: NormalizedDividerOptions<TCode, TData> },
  [Outlet.SPACER]: { options: NormalizedSpacerOptions<TCode, TData> },
  [Outlet.PROGRESS_BAR]: { options: NormalizedProgressBarOptions<TCode, TData> },
  [Outlet.SPINNER]: { options: NormalizedSpinnerOptions<TCode, TData> },
}
