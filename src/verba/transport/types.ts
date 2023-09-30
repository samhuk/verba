import {
  NestState,
  OutletSpinner,
  VerbaOptions,
} from '../types'
import {
  NormalizedDividerOptions,
  NormalizedJsonOptions,
  NormalizedProgressBarOptions,
  NormalizedSimpleOutletOptions,
  NormalizedSpacerOptions,
  NormalizedSpinnerOptions,
  NormalizedTableOptions,
  Outlet,
  OutletToNormalizedArgsObj,
} from '../outlet/types'

import { ListenerStore } from '../util/listenerStore/types'
import { ProgressBar } from '../progressBar/types'
import { TypeDependantBaseIntersection } from '../util/types'

export type OutletToTransportHandlerFn<
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any
> = {
  [Outlet.LOG]: (options: NormalizedSimpleOutletOptions<TCode, TData>) => void,
  // -- Simple outlets
  [Outlet.INFO]: (options: NormalizedSimpleOutletOptions<TCode, TData>) => void,
  [Outlet.STEP]: (options: NormalizedSimpleOutletOptions<TCode, TData>) => void,
  [Outlet.SUCCESS]: (options: NormalizedSimpleOutletOptions<TCode, TData>) => void,
  [Outlet.WARN]: (options: NormalizedSimpleOutletOptions<TCode, TData>) => void,
  [Outlet.ERROR]: (options: NormalizedSimpleOutletOptions<TCode, TData>) => void,
  // -- Other outlets
  [Outlet.TABLE]: (data: any, options: NormalizedTableOptions<TCode, TData>) => void,
  [Outlet.JSON]: (value: any, options: NormalizedJsonOptions<TCode, TData>) => void,
  [Outlet.DIVIDER]: (options: NormalizedDividerOptions<TCode, TData>) => void,
  [Outlet.SPACER]: (options: NormalizedSpacerOptions<TCode, TData>) => void,
  [Outlet.SPINNER]: (options: NormalizedSpinnerOptions<TCode, TData>) => OutletSpinner | undefined,
  [Outlet.PROGRESS_BAR]: (options: NormalizedProgressBarOptions<TCode, TData>) => ProgressBar | undefined,
}

export type OutletHandlerFnOptions<
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any,
  TOutlet extends Outlet = Outlet
> = TypeDependantBaseIntersection<
  Outlet,
  OutletToNormalizedArgsObj<TCode, TData>,
  TOutlet,
  'outlet'
>

export type VerbaTransportEventName = 'onBeforeLog' | 'onAfterLog'

export type VerbaTransportEventHandlers<
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any
> = {
  onBeforeLog: (options: OutletHandlerFnOptions<TCode, TData>, nestState: NestState<TCode>) => void
  onAfterLog: (options: OutletHandlerFnOptions<TCode, TData>, nestState: NestState<TCode>) => void
}

export type VerbaTransportListenerStore = ListenerStore<VerbaTransportEventName, VerbaTransportEventHandlers>

export type NestedInstantiatedVerbaTransport<
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any
> = OutletToTransportHandlerFn<TCode, TData>

export type InstantiatedVerbaTransport<
  TCode extends string | number | undefined = string | number | undefined,
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
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any
> = (
  /**
   * The top-level verba-logger options that was received.
   */
  options: VerbaOptions<TCode, TData>,
  /**
   * A listener store that can be used to add listeners to various events of
   * the verba logger.
   */
  listeners: VerbaTransportListenerStore,
  /**
   * Registers the given asynchronous `handler` function to be ran when the
   * top-level `close` function is called (on the `Verba` instance).
   * 
   * This is useful for when a Transport needs to perform tear-down operations
   * (such as waiting for an API request to finish, waiting for a write stream
   * to finish draining, and so on).
   * 
   * Notably, this is used by default in the current contexts:
   * * By `fileTransport` to ensure that logs finish getting written to file
   * before the node program fully exits.
   * * By `fileTransport` and `consoleTransport` when batching is enabled, to
   * ensure that batched log messages are processed before the node program
   * fully exits.
   */
  registerOnClose: (handler: () => (Promise<void> | void)) => void
) => InstantiatedVerbaTransport<TCode, TData>
