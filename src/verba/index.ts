import {
  InstantiatedVerbaTransport,
  NestedInstantiatedVerbaTransport,
  OutletHandlerFnOptions,
  VerbaTransport,
  VerbaTransportEventHandlers,
  VerbaTransportEventName,
  VerbaTransportListenerStore,
} from './transport/types'
import {
  NestState,
  Verba,
  VerbaBaseOutlets,
  VerbaOptions,
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
import { createIndentationString } from './util/indentation'
import { createListenerStore } from './util/listenerStore'
import { isVerbaString } from './verbaString'
import { createObservable } from './util/reactive'

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

const createExecutor = (
  nestedInstantiatedTransports: NestedInstantiatedVerbaTransport<any, any>[],
  listeners: VerbaTransportListenerStore,
  nestState: NestState,
) => (
  options: OutletHandlerFnOptions,
  executor: (t: NestedInstantiatedVerbaTransport) => void,
) => {
  listeners.call('onBeforeLog', options, nestState)
  nestedInstantiatedTransports.forEach(executor)
  listeners.call('onAfterLog', options, nestState)
}

const mergeObjectsOfFunctions = <T extends Record<string, Function>>(objs: T[], keys: (keyof T)[]): T => {
  const outputObj: T = {} as T

  // Ensure that all keys lead to a function
  keys.forEach(k => outputObj[k] = (() => undefined) as any)

  keys.forEach(k => {
    const fns = objs.map(o => o[k])
    outputObj[k] = ((...args: any[]) => fns.forEach(fn => fn(...args))) as any
  })

  return outputObj
}

const _verba = <
  TCode extends string | number = string | number,
  TData extends any = any,
  TAliases extends Aliases<TCode, TData> = Aliases<TCode, TData>,
>(
  options: VerbaOptions<TCode, TData>,
  aliases: TAliases,
  instantiatedTransports: InstantiatedVerbaTransport<TCode, TData>[],
  nestedInstantiatedTransports: NestedInstantiatedVerbaTransport<TCode, TData>[],
  listeners: ListenerStore<VerbaTransportEventName, VerbaTransportEventHandlers<TCode, TData>>,
  nestState: NestState<TCode>,
  close: () => Promise<void[]>,
): Verba<TCode, TData, TAliases> => {
  const execute = createExecutor(nestedInstantiatedTransports, listeners, nestState)

  const baseOutlets: VerbaBaseOutlets<TCode, TData> = {
    log: _options => {
      const normalizedOptions = normalizeSimpleOutletOptions(_options)
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.LOG, options: normalizedOptions }) === false) ?? false
      if (excluded)
        return

      execute({ outlet: Outlet.LOG, options: normalizedOptions }, t => t.log(normalizedOptions))
    },
    info: _options => {
      const normalizedOptions = normalizeSimpleOutletOptions(_options)
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.INFO, options: normalizedOptions }) === false) ?? false
      if (excluded)
        return

      execute({ outlet: Outlet.INFO, options: normalizedOptions }, t => t.info(normalizedOptions))
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
        const result = mergeObjectsOfFunctions(results, ['color', 'destroy', 'pause', 'start', 'stopAndPersist', 'text'])
        listeners.call('onAfterLog', { outlet: Outlet.STEP, options: normalizedOptions }, nestState)
        return result as any
      }

      if (!excluded)
        execute({ outlet: Outlet.STEP, options: normalizedOptions }, t => t.step(normalizedOptions))
    },
    success: _options => {
      const normalizedOptions = normalizeSimpleOutletOptions(_options)
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.SUCCESS, options: normalizedOptions }) === false) ?? false
      if (excluded)
        return

      execute({ outlet: Outlet.SUCCESS, options: normalizedOptions }, t => t.success(normalizedOptions))
    },
    warn: _options => {
      const normalizedOptions = normalizeSimpleOutletOptions(_options)
      const excluded = options.outletFilters
        ?.some(outletFilter => outletFilter({ outlet: Outlet.WARN, options: normalizedOptions }) === false) ?? false
      if (excluded)
        return

      execute({ outlet: Outlet.WARN, options: normalizedOptions }, t => t.warn(normalizedOptions))
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

      execute({ outlet: Outlet.TABLE, options: normalizedOptions, data }, t => t.table(data, normalizedOptions))
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

      execute({ outlet: Outlet.JSON, options: normalizedOptions, value }, t => t.json(value, normalizedOptions))
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

      execute({ outlet: Outlet.DIVIDER, options: normalizedOptions }, t => t.divider(normalizedOptions))
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

      execute({ outlet: Outlet.SPACER, options: normalizedOptions }, t => t.spacer(normalizedOptions))
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
      const result = mergeObjectsOfFunctions(results, ['update', 'clear', 'persist', 'updateValue', 'render'])
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
      return _verba(
        options,
        aliases,
        instantiatedTransports,
        instantiatedTransports.map(p => p(newNestState)),
        listeners,
        newNestState,
        close,
      )
    },
    setAliases: newAliases => _verba(
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
 * Creates a `Verba` instance.
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
export const verba = <
  TCode extends string | number = string | number,
  TData extends any = any,
>(options?: VerbaOptions<TCode, TData>): Verba<TCode, TData, {}> => {
  const _options = options ?? { }
  const listeners = createListenerStore<keyof VerbaTransportEventHandlers<TCode, TData>, VerbaTransportEventHandlers<TCode, TData>>()
  const transports: VerbaTransport<TCode, TData>[] = _options.transports
    ?? ([consoleTransport()] as VerbaTransport<TCode, TData>[])
  const closeObservable = createObservable()
  const instantiatedTransports = transports.map(transport => transport(_options, listeners, closeObservable.subscribe)) ?? []
  const nestState: NestState<TCode> = {
    code: undefined,
    indent: 0,
    indentationString: '',
  }
  return _verba(
    _options,
    {},
    instantiatedTransports,
    instantiatedTransports.map(p => p(nestState)),
    listeners,
    nestState,
    closeObservable.broadcast,
  )
}
