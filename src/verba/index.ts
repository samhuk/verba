import { InstantiatedVerbaTransport, VerbaTransport, VerbaTransportEventHandlers } from './transport/types'
import {
  NestState,
  NormalizedDividerOptions,
  NormalizedJsonOptions,
  NormalizedSimpleOutletOptions,
  NormalizedSpacerOptions,
  NormalizedTableOptions,
  Outlet,
  SimpleOutlet,
  SimpleOutletOptions,
  VerbaLogger,
  VerbaLoggerOptions,
} from './types'
import { NormalizedStepOptions, StepOptions, StepSpinner } from './step/types'

import { ListenerStore } from './util/listenerStore/types'
import { consoleTransport } from './transport/console'
import { createIndentationString } from './util/indentation'
import { createListenerStore } from './util/listenerStore'
import { isVerbaString } from './verbaString'

/**
 * Determines if the given `outlet` is one of the simple outlets,
 * i.e. `log`, `info`, `step`, `success`, or `warn`.
 */
export const isSimpleOutlet = (outlet: unknown): outlet is SimpleOutlet => (
  outlet === Outlet.LOG
  || outlet === Outlet.INFO
  || outlet === Outlet.WARN
  || outlet === Outlet.STEP
  || outlet === Outlet.SUCCESS
)

const normalizeSimpleOutletOptions = <
  TCode extends string | number = string | number,
  TData extends any = any,
>(
  options: SimpleOutletOptions<TCode, TData>,
): NormalizedSimpleOutletOptions<TCode, TData> => (
  isVerbaString(options)
    ? {
      msg: options,
      code: undefined,
      data: undefined,
    }
    : {
      msg: options.msg,
      code: options.code ?? undefined,
      data: options.data ?? undefined,
    }
)

const normalizeStepOptions = <
  TCode extends string | number = string | number,
  TData extends any = any,
>(
  options: StepOptions<TCode, TData>,
): NormalizedStepOptions<TCode, TData> => (
  isVerbaString(options)
    ? {
      msg: options,
      code: undefined,
      data: undefined,
      spinner: undefined,
    }
    : {
      msg: options.msg,
      code: options.code ?? undefined,
      data: options.data ?? undefined,
      spinner: options.spinner,
    }
)

const _createVerbaLogger = <
  TCode extends string | number = string | number,
  TData extends any = any,
  TOptions extends VerbaLoggerOptions<TCode, TData> = VerbaLoggerOptions<TCode, TData>,
>(
  options: TOptions,
  instantiatedTransports: InstantiatedVerbaTransport<TCode, TData>[],
  listeners: ListenerStore<keyof VerbaTransportEventHandlers<TCode, TData>, VerbaTransportEventHandlers<TCode, TData>>,
  nestState: NestState<TCode>,
): VerbaLogger<TCode, TData, TOptions> => {
  const nestedInstantiatedTransports = instantiatedTransports.map(p => p(nestState))

  return {
    nest: _options => {
      const indent = nestState.indent + (_options.indent ?? 0)
      return _createVerbaLogger(
        options,
        instantiatedTransports,
        listeners,
        {
          indent,
          indentationString: createIndentationString(indent),
          code: _options.code === null ? undefined : (nestState.code ?? _options.code),
        },
      )
    },
    log: _options => {
      const normalizedOptions = normalizeSimpleOutletOptions(_options)
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.LOG, options: normalizedOptions }) === false) ?? false
      if (excluded)
        return

      listeners.call('onBeforeLog', { outlet: Outlet.LOG, options: normalizedOptions }, nestState)
      nestedInstantiatedTransports.forEach(p => p.log(normalizedOptions))
      listeners.call('onAfterLog', { outlet: Outlet.LOG, options: normalizedOptions }, nestState)
    },
    info: _options => {
      const normalizedOptions = normalizeSimpleOutletOptions(_options)
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.INFO, options: normalizedOptions }) === false) ?? false
      if (excluded)
        return

      listeners.call('onBeforeLog', { outlet: Outlet.INFO, options: normalizedOptions }, nestState)
      nestedInstantiatedTransports.forEach(p => p.info(normalizedOptions))
      listeners.call('onAfterLog', { outlet: Outlet.INFO, options: normalizedOptions }, nestState)
    },
    step: _options => {
      const normalizedOptions = normalizeStepOptions<TCode, TData>(_options)
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.STEP, options: normalizedOptions }) === false) ?? false
      if (normalizedOptions.spinner) {
        if (excluded) {
          const result: StepSpinner = {
            text: (...args) => undefined,
            color: (...args) => undefined,
            start: (...args) => undefined,
            temporarilyClear: (...args) => undefined,
            pause: (...args) => undefined,
            destroy: (...args) => undefined,
            stopAndPersist: (...args) => undefined,
          }
          return result as any
        }
        listeners.call('onBeforeLog', { outlet: Outlet.STEP, options: normalizedOptions }, nestState)
        const results = nestedInstantiatedTransports.map(p => p.step(normalizedOptions)).filter(v => v != null) as unknown as StepSpinner[]
        const result: StepSpinner = {
          text: (...args) => results.forEach(r => r.text(...args)),
          color: (...args) => results.forEach(r => r.color(...args)),
          start: (...args) => results.forEach(r => r.start(...args)),
          temporarilyClear: (...args) => results.forEach(r => r.temporarilyClear(...args)),
          pause: (...args) => results.forEach(r => r.pause(...args)),
          destroy: (...args) => results.forEach(r => r.destroy(...args)),
          stopAndPersist: (...args) => results.forEach(r => r.stopAndPersist(...args)),
        }
        listeners.call('onAfterLog', { outlet: Outlet.STEP, options: normalizedOptions }, nestState)
        return result as any
      }
      else {
        if (excluded)
          return

        listeners.call('onBeforeLog', { outlet: Outlet.STEP, options: normalizedOptions }, nestState)
        nestedInstantiatedTransports.forEach(p => p.step(normalizedOptions))
        listeners.call('onAfterLog', { outlet: Outlet.STEP, options: normalizedOptions }, nestState)
      }
    },
    success: _options => {
      const normalizedOptions = normalizeSimpleOutletOptions(_options)
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.SUCCESS, options: normalizedOptions }) === false) ?? false
      if (excluded)
        return

      listeners.call('onBeforeLog', { outlet: Outlet.SUCCESS, options: normalizedOptions }, nestState)
      nestedInstantiatedTransports.forEach(p => p.success(normalizedOptions))
      listeners.call('onAfterLog', { outlet: Outlet.SUCCESS, options: normalizedOptions }, nestState)
    },
    warn: _options => {
      const normalizedOptions = normalizeSimpleOutletOptions(_options)
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.WARN, options: normalizedOptions }) === false) ?? false
      if (excluded)
        return

      listeners.call('onBeforeLog', { outlet: Outlet.WARN, options: normalizedOptions }, nestState)
      nestedInstantiatedTransports.forEach(p => p.warn(normalizedOptions))
      listeners.call('onAfterLog', { outlet: Outlet.WARN, options: normalizedOptions }, nestState)
    },
    table: (data, _options) => {
      const normalizedOptions: NormalizedTableOptions<TCode> = {
        ...(_options ?? {}),
        code: _options?.code ?? undefined,
        data: _options?.data,
      }
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.TABLE, data, options: normalizedOptions }) === false) ?? false
      if (excluded)
        return

      listeners.call('onBeforeLog', { outlet: Outlet.TABLE, options: normalizedOptions, data }, nestState)
      nestedInstantiatedTransports.forEach(p => p.table(data, normalizedOptions))
      listeners.call('onAfterLog', { outlet: Outlet.TABLE, options: normalizedOptions, data }, nestState)
    },
    json: (value, _options) => {
      const normalizedOptions: NormalizedJsonOptions<TCode> = {
        pretty: _options?.pretty ?? false,
        code: _options?.code ?? undefined,
        data: _options?.data ?? undefined,
      }
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.JSON, value, options: normalizedOptions }) === false) ?? false
      if (excluded)
        return

      listeners.call('onBeforeLog', { outlet: Outlet.JSON, options: normalizedOptions, value }, nestState)
      nestedInstantiatedTransports.forEach(p => p.json(value, normalizedOptions))
      listeners.call('onAfterLog', { outlet: Outlet.JSON, options: normalizedOptions, value }, nestState)
    },
    divider: _options => {
      const normalizedOptions: NormalizedDividerOptions<TCode> = {
        code: _options?.code ?? undefined,
        data: _options?.data ?? undefined,
      }
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.DIVIDER, options: normalizedOptions }) === false) ?? false
      if (excluded)
        return

      listeners.call('onBeforeLog', { outlet: Outlet.DIVIDER, options: normalizedOptions }, nestState)
      nestedInstantiatedTransports.forEach(p => p.divider(normalizedOptions))
      listeners.call('onAfterLog', { outlet: Outlet.DIVIDER, options: normalizedOptions }, nestState)
    },
    spacer: _options => {
      const normalizedOptions: NormalizedSpacerOptions<TCode> = typeof _options === 'object'
        ? {
          numLines: _options?.numLines ?? 1,
          code: _options?.code ?? undefined,
          data: _options?.data ?? undefined,
        }
        : { numLines: 1, code: undefined, data: undefined }
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.SPACER, options: normalizedOptions }) === false) ?? false
      if (excluded)
        return

      listeners.call('onBeforeLog', { outlet: Outlet.SPACER, options: normalizedOptions }, nestState)
      nestedInstantiatedTransports.forEach(p => p.spacer(normalizedOptions))
      listeners.call('onAfterLog', { outlet: Outlet.SPACER, options: normalizedOptions }, nestState)
    },
  }
}

/**
 * Creates a `VerbaLogger` instance.
 * 
 * @example
 * import verba from 'verba'
 * 
 * const log = verba()
 * 
 * // -- Simple outlets
 * log.step('Starting task')
 * log.info(f => `Estimated task length: ${f.cyan('5m4s')}`)
 * log.success('Task completed')
 * log.warn({
 *   msg: f => `Env var ${f.bold('DB_URL')} is missing; using default.`,
 *   code: 'ENV_VALIDATE',
 * })
 * // -- Nesting
 * const childLog = log.nest({ code: 'CHILD_TASK' })
 * childLog.step('Starting child task')
 * // -- Other outlets
 * log.divider()
 * log.spacer()
 * log.table([{...},{...],...])
 * log.json({ foo: 'bar' })
 */
export const createVerbaLogger = <
  TCode extends string | number = string | number,
  TData extends any = any,
  TOptions extends VerbaLoggerOptions<TCode, TData> = VerbaLoggerOptions<TCode, TData>,
// eslint-disable-next-line arrow-body-style
>(options?: TOptions): VerbaLogger<TCode, TData, TOptions> => {
  const _options: TOptions = options ?? { } as TOptions
  const listeners = createListenerStore<keyof VerbaTransportEventHandlers<TCode, TData>, VerbaTransportEventHandlers<TCode, TData>>()
  const transports: VerbaTransport<TCode, TData>[] = _options.transports
    ?? ([consoleTransport] as unknown as VerbaTransport<TCode, TData>[])
  const instantiatedTransports = transports.map(p => p(_options, listeners)) ?? []
  return _createVerbaLogger<TCode, TData, TOptions>(
    _options,
    instantiatedTransports,
    listeners,
    {
      code: undefined,
      indent: 0,
      indentationString: '',
    },
  )
}
