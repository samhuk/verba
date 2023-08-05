import {
  NestState,
  VerbaLoggerOptions,
} from "../types"
import {
  NormalizedDividerOptions,
  NormalizedJsonOptions,
  NormalizedProgressBarOptions,
  NormalizedSimpleOutletOptions,
  NormalizedSpacerOptions,
  NormalizedTableOptions,
  Outlet,
  OutletToHandlerArgsObjs,
} from "../outlet/types"
import { NormalizedStepOptions, StepResult } from "../step/types"

import { ListenerStore } from "../util/listenerStore/types"
import { ProgressBar } from '../progressBar/types'
import { TypeDependantBaseIntersection } from '../util/types'

export type OutletToTransportHandlerFn<
  TCode extends string | number = string | number,
  TData extends any = any
> = {
  // -- Simple outlets
  [Outlet.LOG]: (options: NormalizedSimpleOutletOptions<TCode, TData>) => void,
  [Outlet.INFO]: (options: NormalizedSimpleOutletOptions<TCode, TData>) => void,
  [Outlet.STEP]: <TOptions extends NormalizedStepOptions<TCode, TData>>(options: TOptions) => StepResult<TOptions>,
  [Outlet.SUCCESS]: (options: NormalizedSimpleOutletOptions<TCode, TData>) => void,
  [Outlet.WARN]: (options: NormalizedSimpleOutletOptions<TCode, TData>) => void,
  // -- Other outlets
  [Outlet.TABLE]: (data: any, options: NormalizedTableOptions<TCode, TData>) => void,
  [Outlet.JSON]: (value: any, options: NormalizedJsonOptions<TCode, TData>) => void,
  [Outlet.DIVIDER]: (options: NormalizedDividerOptions<TCode, TData>) => void,
  [Outlet.SPACER]: (options: NormalizedSpacerOptions<TCode, TData>) => void,
  [Outlet.PROGRESS_BAR]: (options: NormalizedProgressBarOptions<TCode, TData>) => ProgressBar | undefined,
}

export type OutletHandlerFnOptions<
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
> = OutletToTransportHandlerFn<TCode, TData>

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
  options: VerbaLoggerOptions<TCode, TData>,
  /**
   * A listener store that can be used to add listeners to various events of
   * the verba logger.
   */
  listeners: ListenerStore<
    keyof VerbaTransportEventHandlers<TCode, TData>,
    VerbaTransportEventHandlers<TCode, TData>
  >,
  /**
   * Registers the given asynchronous `handler` function to be ran when the
   * top-level `close` function is called (on the `VerbaLogger` instance).
   * 
   * This is very useful for when a Transport needs to perform tear-down
   * operations (such as waiting for an API request to finish, waiting for
   * a write stream to finish draining, etc.).
   * 
   * Notably, this is used by `fileTransport`.
   */
  registerOnClose: (handler: () => (Promise<void> | void)) => void
) => InstantiatedVerbaTransport<TCode, TData>
