import { InfoOptions, JsonOptions, NestState, Outlet, SuccessOptions, VerbaLoggerOptions, WarnOptions } from "../types"
import { StepOptions, StepResult } from "../step/types"

import { GlobalOptions as ColumifyOptions } from 'columnify'
import { ListenerStore } from "../util/listenerStore/types"
import { TypeDependantBaseIntersection } from '../util/types'
import { VerbaString } from "../verbaString/types"

export type OutletToHandlerArgsObjs<
  TCode extends string | number = string | number,
  TData extends any = any
> = {
  [Outlet.LOG]: { msg: VerbaString },
  [Outlet.INFO]: { options: InfoOptions<TCode, TData> },
  [Outlet.STEP]: { options: StepOptions<TCode, TData> },
  [Outlet.SUCCESS]: { options: SuccessOptions<TCode, TData> },
  [Outlet.WARN]: { options: WarnOptions<TCode, TData> },
  [Outlet.TABLE]: { data: any, options?: ColumifyOptions },
  [Outlet.JSON]: { value: any, options?: JsonOptions },
  [Outlet.DIVIDER]: { },
  [Outlet.SPACER]: { numLines?: number },
}

export type OutletToHandlerFn<
  TCode extends string | number = string | number,
  TData extends any = any
> = {
  [Outlet.LOG]: (msg: VerbaString) => void
  [Outlet.INFO]: (options: InfoOptions<TCode, TData>) => void,
  [Outlet.STEP]: <TStepOptions extends StepOptions<TCode>>(options: TStepOptions) => StepResult<TStepOptions> | undefined,
  [Outlet.SUCCESS]: (options: SuccessOptions<TCode, TData>) => void,
  [Outlet.WARN]: (options: WarnOptions<TCode, TData>) => void,
  [Outlet.TABLE]: (data: any, options?: ColumifyOptions) => void,
  [Outlet.JSON]: (value: any, options?: JsonOptions) => void,
  [Outlet.DIVIDER]: () => void,
  [Outlet.SPACER]: (numLines?: number) => void,
}

type OutletHandlerFnOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
  TOutlet extends Outlet = Outlet
> = TypeDependantBaseIntersection<
  Outlet,
  OutletToHandlerArgsObjs<TCode, TData>,
  TOutlet,
  'outlet'
>

export type VerbaTransportEventHandlers<
  TCode extends string | number = string | number,
  TData extends any = any
> = {
  onBeforeLog: (options: OutletHandlerFnOptions<TCode, TData>, nestState: NestState<TCode>) => void
  onAfterLog: (options: OutletHandlerFnOptions<TCode, TData>, nestState: NestState<TCode>) => void
}

export type NestedInstantiatedVerbaTransport<
  TCode extends string | number = string | number,
  TData extends any = any
> = OutletToHandlerFn<TCode, TData>

export type InstantiatedVerbaTransport<
  TCode extends string | number = string | number,
  TData extends any = any
> = (
  /**
   * The current nest state of the logger.
   */
  nestState: NestState<TCode>
) => NestedInstantiatedVerbaTransport<TCode, TData>

/**
 * Defines how log messages are outputted.
 * 
 * @example
 * import verba, { VerbaTransport } from 'verba'
 * 
 * const transport: VerbaTransport = (loggerOptions, listeners) => {
 *   // Parse top-level logger options, add event listeners, perform setup...
 *   return nestState => {
 *     // ...
 *     return {
 *       log: msg => ...,
 *       info: options => ...,
 *       step: options => ...,
 *       success: options => ...,
 *       warn: options => ...,
 *       table: (data, options) => ...,
 *       json: (data, options) => ...,
 *       divider: () => ...,
 *       spacer: numLines => ...,
 *     }
 *   }
 * }
 * 
 * const log = verba({ plugins: [transport] })
 */
export type VerbaTransport<
  TCode extends string | number = string | number,
  TData extends any = any
> = (
  /**
   * The top-level verba-logger options that was received.
   */
  options: VerbaLoggerOptions,
  /**
   * A listener store that can be used to add listeners to various events of
   * the verba logger.
   */
  listeners: ListenerStore<
    keyof VerbaTransportEventHandlers<TCode, TData>,
    VerbaTransportEventHandlers<TCode, TData>
  >,
) => InstantiatedVerbaTransport<TCode, TData>
