import { InstantiatedVerbaTransport, NestedInstantiatedVerbaTransport, VerbaTransport, VerbaTransportEventHandlers } from './transport/types'
import {
  NestState,
  VerbaLogger,
  VerbaLoggerBaseOutlets,
  VerbaLoggerOptions,
} from './types'
import {
  NormalizedDividerOptions,
  NormalizedJsonOptions,
  NormalizedProgressBarOptions,
  NormalizedSimpleOutletOptions,
  NormalizedSpacerOptions,
  NormalizedTableOptions,
  Outlet,
  SimpleOutlet,
  SimpleOutletOptions,
} from './outlet/types'
import { NormalizedStepOptions, StepOptions, StepSpinner } from './step/types'

import { Aliases } from './alias/types'
import { ListenerStore } from './util/listenerStore/types'
import { ProgressBar } from './progressBar/types'
import { consoleTransport } from './transport/console'
import { createCloseNotifier } from './transport/file'
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
  TAliases extends Aliases<TCode, TData> = Aliases<TCode, TData>,
>(
  options: VerbaLoggerOptions<TCode, TData>,
  aliases: TAliases,
  instantiatedTransports: InstantiatedVerbaTransport<TCode, TData>[],
  nestedInstantiatedTransports: NestedInstantiatedVerbaTransport<TCode, TData>[],
  listeners: ListenerStore<keyof VerbaTransportEventHandlers<TCode, TData>, VerbaTransportEventHandlers<TCode, TData>>,
  nestState: NestState<TCode>,
  close: () => Promise<void[]>,
): VerbaLogger<TCode, TData, TAliases> => {
  const baseOutlets: VerbaLoggerBaseOutlets<TCode, TData> = {
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
        // If excluded, return step spinner shim
        if (excluded) {
          const result: StepSpinner = {
            text: (...args) => undefined,
            color: (...args) => undefined,
            start: (...args) => undefined,
            pause: (...args) => undefined,
            destroy: (...args) => undefined,
            stopAndPersist: (...args) => undefined,
          }
          return result as any
        }
        listeners.call('onBeforeLog', { outlet: Outlet.STEP, options: normalizedOptions }, nestState)
        // Run all transport `step` functions
        const results = nestedInstantiatedTransports.map(p => p.step(normalizedOptions)).filter(v => v != null) as unknown as StepSpinner[]
        const result: StepSpinner = {
          text: (...args) => results.forEach(r => r.text(...args)),
          color: (...args) => results.forEach(r => r.color(...args)),
          start: (...args) => results.forEach(r => r.start(...args)),
          pause: (...args) => results.forEach(r => r.pause(...args)),
          destroy: (...args) => results.forEach(r => r.destroy(...args)),
          stopAndPersist: (...args) => results.forEach(r => r.stopAndPersist(...args)),
        }
        listeners.call('onAfterLog', { outlet: Outlet.STEP, options: normalizedOptions }, nestState)
        return result as any
      }
      else if (!excluded) {
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
      const normalizedOptions: NormalizedTableOptions<TCode, TData> = {
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
      const normalizedOptions: NormalizedJsonOptions<TCode, TData> = {
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
      const normalizedOptions: NormalizedDividerOptions<TCode, TData> = {
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
      const normalizedOptions: NormalizedSpacerOptions<TCode, TData> = typeof _options === 'object'
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
    progressBar: _options => {
      const normalizedOptions: NormalizedProgressBarOptions<TCode, TData> = {
        total: _options?.total ?? 100,
        barLength: _options?.barLength ?? 30,
        code: _options?.code ?? undefined,
        data: _options?.data ?? undefined,
      }
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.PROGRESS_BAR, options: normalizedOptions }) === false) ?? false
      // If excluded, return progress bar shim
      if (excluded) {
        return {
          update: (...args) => undefined,
          clear: (...args) => undefined,
          persist: (...args) => undefined,
          updateValue: (...args) => undefined,
          render: (...args) => undefined,
        }
      }
      listeners.call('onBeforeLog', { outlet: Outlet.PROGRESS_BAR, options: normalizedOptions }, nestState)
      const results = nestedInstantiatedTransports.map(p => p.progressBar(normalizedOptions)).filter(v => v != null) as ProgressBar[]
      const result: ProgressBar = {
        update: (...args) => results.forEach(r => r.update(...args)),
        clear: (...args) => results.forEach(r => r.clear(...args)),
        persist: (...args) => results.forEach(r => r.persist(...args)),
        updateValue: (...args) => results.forEach(r => r.updateValue(...args)),
        render: (...args) => results.forEach(r => r.render(...args)),
      }
      listeners.call('onAfterLog', { outlet: Outlet.PROGRESS_BAR, options: normalizedOptions }, nestState)
      return result
    },
  }

  const aliasOutlets: any = {}

  Object.entries(aliases ?? {}).forEach(([aliasName, aliasFactory]) => {
    aliasOutlets[aliasName] = aliasFactory(baseOutlets)
  })
  
  return {
    nest: _options => {
      const indent = _options.indent ?? 0
      const newNestState: NestState<TCode> = {
        indent,
        indentationString: createIndentationString(indent),
        code: _options.code === null ? undefined : (nestState.code ?? _options.code),
      }
      return _createVerbaLogger(
        options,
        aliases,
        instantiatedTransports,
        instantiatedTransports.map(p => p(newNestState)),
        listeners,
        newNestState,
        close,
      )
    },
    setAliases: newAliases => _createVerbaLogger(
      options,
      newAliases,
      instantiatedTransports,
      nestedInstantiatedTransports,
      listeners,
      nestState,
      close,
    ),
    ...baseOutlets,
    ...aliasOutlets,
    close,
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
>(options?: VerbaLoggerOptions<TCode, TData>): VerbaLogger<TCode, TData, {}> => {
  const _options = options ?? { }
  const listeners = createListenerStore<keyof VerbaTransportEventHandlers<TCode, TData>, VerbaTransportEventHandlers<TCode, TData>>()
  const transports: VerbaTransport<TCode, TData>[] = _options.transports
    ?? ([consoleTransport()] as VerbaTransport<TCode, TData>[])
  const closeNotifier = createCloseNotifier()
  const instantiatedTransports = transports.map(p => p(_options, listeners, closeNotifier.register)) ?? []
  const nestState: NestState<TCode> = {
    code: undefined,
    indent: 0,
    indentationString: '',
  }
  return _createVerbaLogger(
    _options,
    {},
    instantiatedTransports,
    instantiatedTransports.map(p => p(nestState)),
    listeners,
    nestState,
    closeNotifier.close,
  )
}
