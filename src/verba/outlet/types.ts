import { GlobalOptions as ColumifyOptions } from 'columnify'
import { NormalizedStepOptions } from "../step/types"
import { VerbaString } from "../verbaString/types"

export enum Outlet {
  LOG = 'log',
  INFO = 'info',
  STEP = 'step',
  SUCCESS = 'success',
  WARN = 'warn',
  TABLE = "table",
  JSON = "json",
  DIVIDER = "divider",
  SPACER = "spacer",
}

export type SimpleOutlet = 'info' | 'step' | 'success' | 'warn'

export type SimpleOutletPrefixesOptions = Partial<Record<SimpleOutlet, VerbaString>>

export type SimpleOutletPrefixes = Record<SimpleOutlet, string>

export type SimpleOutletOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = VerbaString | {
  /**
   * The log message.
   * 
   * @example
   * '5 users found'
   * f => `${f.yellow('5')} users found`
   */
  msg: VerbaString
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
   * ...
   */
  code?: TCode
}

export type NormalizedSimpleOutletOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * The log message.
   */
  msg: VerbaString
  /**
   * Data associated with the log message.
   */
  data: TData | undefined
  /**
   * Log code of the log message.
   */
  code: TCode | undefined
}

export type JsonOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * If `true`, the output JSON will be indented as per `JSON.stringify({ ... }, null, 2)`.
   * 
   * @default false
   */
  pretty?: boolean
  /**
   * Optional data to associate with the log message.
   */
  data?: TData
  /**
   * Optional log code for the log message.
   */
  code?: TCode
}

export type NormalizedJsonOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * If `true`, the output JSON will be indented as per `JSON.stringify({ ... }, null, 2)`.
   */
  pretty: boolean
  /**
   * Data associated with the log message.
   */
  data: TData | undefined
  /**
   * Log code of the log message.
   */
  code: TCode | undefined
}

export type TableOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = ColumifyOptions & {
  /**
   * Optional log code for the log message.
   */
  code?: TCode
  /**
   * Optional data to associate with the log message.
   */
  data?: TData
}

export type NormalizedTableOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = ColumifyOptions & {
  /**
   * Log code of the log message.
   */
  code: TCode | undefined
  /**
   * Data associated with the log message.
   */
  data: TData | undefined
}
/**
 * Options for `spacer` log calls. This can take either an integer value
 * to denote the number of lines, or an object to provide more information.
 * 
 * @default 1
 */
export type SpacerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = number | {
  /**
   * The number of lines.
   * 
   * @default 1
   */
  numLines?: number
  /**
   * Optional data to associate with the log message.
   */
  data?: TData
  /**
   * Optional log code for the log message.
   */
  code?: TCode
}

export type NormalizedSpacerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * The number of lines.
   */
  numLines: number
  /**
   * Log code of the log message.
   */
  code: TCode | undefined
  /**
   * Data associated with the log message.
   */
  data: TData | undefined
}

export type DividerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * Optional log code for the log message.
   */
  code?: TCode
  /**
   * Optional data to associate with the log message.
   */
  data?: TData
}

export type NormalizedDividerOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  /**
   * Log code of the log message.
   */
  code: TCode | undefined
  /**
   * Data associated with the log message.
   */
  data: TData | undefined
}

export type OutletToHandlerArgsObjs<
  TCode extends string | number = string | number,
  TData extends any = any
> = {
  // -- Simple outlets
  [Outlet.LOG]: { options: NormalizedSimpleOutletOptions<TCode, TData> },
  [Outlet.INFO]: { options: NormalizedSimpleOutletOptions<TCode, TData> },
  [Outlet.STEP]: { options: NormalizedStepOptions<TCode, TData> },
  [Outlet.SUCCESS]: { options: NormalizedSimpleOutletOptions<TCode, TData> },
  [Outlet.WARN]: { options: NormalizedSimpleOutletOptions<TCode, TData> },
  // -- Other outlets
  [Outlet.TABLE]: { data: any, options: NormalizedTableOptions<TCode, TData> },
  [Outlet.JSON]: { value: any, options: NormalizedJsonOptions<TCode, TData> },
  [Outlet.DIVIDER]: { options: NormalizedDividerOptions<TCode, TData> },
  [Outlet.SPACER]: { options: NormalizedSpacerOptions<TCode, TData> },
}
