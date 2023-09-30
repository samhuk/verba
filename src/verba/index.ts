import {
  ArgsNormalizer,
  dividerArgsNormalizer,
  jsonArgsNormalizer,
  progressBarArgsNormalizer,
  simpleOutletArgsNormalizer,
  spacerArgsNormalizer,
  spinnerArgsNormalizer,
  tableArgsNormalizer,
} from './argsNormalizers'
import {
  InstantiatedVerbaTransport,
  NestedInstantiatedVerbaTransport,
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
  Outlet,
  OutletToNormalizedArgsObj,
  ReturnfulOutlet,
  ReturnlessOutlet,
} from './outlet/types'

import { Aliases } from './alias/types'
import { ListenerStore } from './util/listenerStore/types'
import { OutletFilter } from './outletFilter/types'
import { consoleTransport } from './transport/console'
import { createIndentationString } from './util/indentation'
import { createListenerStore } from './util/listenerStore'
import { createObservable } from './util/reactive'

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

const createReturnlessOutlet = <TOutlet extends ReturnlessOutlet>(
  outlet: TOutlet,
  argsNormalizer: ArgsNormalizer<TOutlet>,
  executor: (t: NestedInstantiatedVerbaTransport, options: OutletToNormalizedArgsObj[TOutlet]) => void,
  outletFilters: OutletFilter<any, any>[] | undefined,
  nestedInstantiatedTransports: NestedInstantiatedVerbaTransport<any, any>[],
  listeners: VerbaTransportListenerStore,
  nestState: NestState,
) => (
  ...outletTransportArgs: Parameters<VerbaBaseOutlets[TOutlet]>
) => {
  // -- Parse options
  const normalizedArgsObj = argsNormalizer(...outletTransportArgs)
  const optionsObj = { outlet, ...normalizedArgsObj }

  // -- Guard by outlet filters
  const excluded = outletFilters
    ?.some(outletFilter => outletFilter(optionsObj as any) === false) ?? false
  if (excluded)
    return

  // -- Execute outlet
  listeners.call('onBeforeLog', optionsObj as any, nestState)
  // Run each transport
  nestedInstantiatedTransports.forEach(t => executor(t, optionsObj))
  listeners.call('onAfterLog', optionsObj as any, nestState)
}

const createReturnfulOutlet = <TOutlet extends ReturnfulOutlet>(
  outlet: TOutlet,
  argsNormalizer: ArgsNormalizer<TOutlet>,
  executor: (t: NestedInstantiatedVerbaTransport, options: OutletToNormalizedArgsObj[TOutlet]) => ReturnType<VerbaBaseOutlets[TOutlet]> | undefined,
  returnObjFunctionNames: (keyof ReturnType<VerbaBaseOutlets[TOutlet]>)[],
  outletFilters: OutletFilter<any, any>[] | undefined,
  nestedInstantiatedTransports: NestedInstantiatedVerbaTransport<any, any>[],
  listeners: VerbaTransportListenerStore,
  nestState: NestState,
) => (
  ...outletTransportArgs: Parameters<VerbaBaseOutlets[TOutlet]>
): ReturnType<VerbaBaseOutlets[TOutlet]> => {
  // -- Parse options
  const normalizedArgsObj = argsNormalizer(...outletTransportArgs)
  const optionsObj = { outlet, ...normalizedArgsObj }

  // -- Guard by outlet filters
  const excluded = outletFilters
    ?.some(outletFilter => outletFilter(optionsObj as any) === false) ?? false
  if (excluded) {
    const fakeObj = {} as ReturnType<VerbaBaseOutlets[TOutlet]>
    returnObjFunctionNames.forEach(fnName => fakeObj[fnName] = (() => undefined) as any)
    return fakeObj
  }

  // -- Execute outlet
  listeners.call('onBeforeLog', optionsObj as any, nestState)
  // Run each transport, collecting the defined results
  const results = nestedInstantiatedTransports
    .map(t => executor(t, optionsObj))
    .filter(v => v != null) as ReturnType<VerbaBaseOutlets[TOutlet]>[]
  // Merge all of the functions of the results (we can't merge state)
  const result = mergeObjectsOfFunctions(results, returnObjFunctionNames)
  listeners.call('onAfterLog', optionsObj as any, nestState)
  return result
}

const _verba = <
  TCode extends string | number | undefined = string | number | undefined,
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
  // TODO: Use currying
  type UnchangingArgs = Parameters<typeof createReturnlessOutlet>
  const unchangingOptions: [UnchangingArgs[3], UnchangingArgs[4], UnchangingArgs[5], UnchangingArgs[6]] = (
    [options?.outletFilters, nestedInstantiatedTransports, listeners, nestState] 
  )

  const baseOutlets: VerbaBaseOutlets<TCode, TData> = {
    log: createReturnlessOutlet(Outlet.LOG, simpleOutletArgsNormalizer, (t, _options) => t.log(_options.options), ...unchangingOptions),
    
    // -- Simple outlets
    info: createReturnlessOutlet(Outlet.INFO, simpleOutletArgsNormalizer, (t, _options) => t.info(_options.options), ...unchangingOptions),
    step: createReturnlessOutlet(Outlet.STEP, simpleOutletArgsNormalizer, (t, _options) => t.step(_options.options), ...unchangingOptions),
    success: createReturnlessOutlet(Outlet.SUCCESS, simpleOutletArgsNormalizer, (t, _options) => t.success(_options.options), ...unchangingOptions),
    warn: createReturnlessOutlet(Outlet.WARN,  simpleOutletArgsNormalizer, (t, _options) => t.warn(_options.options), ...unchangingOptions),
    error: createReturnlessOutlet(Outlet.ERROR, simpleOutletArgsNormalizer, (t, _options) => t.error(_options.options), ...unchangingOptions),

    // -- Other outlets
    table: createReturnlessOutlet(Outlet.TABLE, tableArgsNormalizer, (t, _options) => t.table(_options.data, _options.options), ...unchangingOptions),
    json: createReturnlessOutlet(Outlet.JSON, jsonArgsNormalizer, (t, _options) => t.json(_options.value, _options.options), ...unchangingOptions),
    divider: createReturnlessOutlet(Outlet.DIVIDER, dividerArgsNormalizer, (t, _options) => t.divider(_options.options), ...unchangingOptions),
    spacer: createReturnlessOutlet(Outlet.SPACER, spacerArgsNormalizer, (t, _options) => t.spacer(_options.options), ...unchangingOptions),
    // eslint-disable-next-line max-len
    spinner: createReturnfulOutlet(Outlet.SPINNER, spinnerArgsNormalizer, (t, _options) => t.spinner(_options.options), ['clear', 'color', 'pause', 'persist', 'start', 'text'], ...unchangingOptions),
    // eslint-disable-next-line max-len
    progressBar: createReturnfulOutlet(Outlet.PROGRESS_BAR, progressBarArgsNormalizer, (t, _options) => t.progressBar(_options.options), ['update', 'clear', 'persist', 'updateValue', 'render'], ...unchangingOptions),
  }

  // -- Create aliases object
  const aliasOutlets: any = {}
  Object.entries(aliases ?? {}).forEach(([aliasName, createAliasOutlet]) => {
      aliasOutlets[aliasName] = createAliasOutlet !== false
        ? createAliasOutlet(baseOutlets)
        : () => {
          throw new Error(`The outlet '${aliasName}' was excluded by the configured aliases (achieved by setting the '${aliasName}' outlet to \`false\`).`)
        }
  })

  const child: Verba<TCode, TData>['child'] = _options => {
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
    ) as any
  }
  
  return {
    child,
    // Provide alias for back-compat
    nest: child,
    setAliases: newAliases => _verba(
      options,
      newAliases,
      instantiatedTransports,
      nestedInstantiatedTransports,
      listeners,
      nestState,
      close,
    ),
    // Merge base outlets with alias outlets
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
 * // -- Other outlets
 * log.divider()
 * log.spacer()
 * log.table([{...},{...],...])
 * log.json({ foo: 'bar' })
 * const spinner = log.spinner('Connecting to DB...')
 * // -- Nesting
 * const childLog = log.nest({ code: 'CHILD_TASK' })
 * childLog.step('Starting child task')
 */
export const verba = <
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any,
>(options?: VerbaOptions<TCode, TData>): Verba<TCode, TData, {}> => {
  const _options = options ?? { }
  const listeners = createListenerStore<VerbaTransportEventName, VerbaTransportEventHandlers<TCode, TData>>()
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
