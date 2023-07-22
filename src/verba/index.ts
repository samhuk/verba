import { InstantiatedVerbaPlugin, VerbaPluginEventHandlers } from './plugin/types'
import { NestState, Outlet, VerbaLogger, VerbaLoggerOptions } from './types'
import { StepResult, StepSpinner } from './step/types'

import { ListenerStore } from './util/listenerStore/types'
import { createIndentationString } from './util/indentation'
import { createListenerStore } from './util/listenerStore'

const _createVerbaLogger = <
  TCode extends string | number = string | number,
  TData extends any = any,
  TOptions extends VerbaLoggerOptions = VerbaLoggerOptions,
>(
  options: TOptions,
  instantiatedPlugins: InstantiatedVerbaPlugin[],
  listeners: ListenerStore<keyof VerbaPluginEventHandlers<TCode, TData>, VerbaPluginEventHandlers<TCode, TData>>,
  nestState: NestState<TCode>,
): VerbaLogger<TOptions, TCode, TData> => {
  const nestedInstantiatedPlugins = instantiatedPlugins.map(p => p(nestState))

  return {
    nest: _options => {
      const indent = nestState.indent + (_options.indent ?? 0)
      return _createVerbaLogger(
        options,
        instantiatedPlugins,
        listeners,
        {
          indent,
          indentationString: createIndentationString(indent),
          code: _options.code === null ? undefined : (nestState.code ?? _options.code),
        },
      )
    },
    log: msg => {
      listeners.call('onBeforeLog', { outlet: Outlet.LOG, msg }, nestState)
      nestedInstantiatedPlugins.forEach(p => p.log(msg))
      listeners.call('onAfterLog', { outlet: Outlet.LOG, msg }, nestState)
    },
    info: _options => {
      listeners.call('onBeforeLog', { outlet: Outlet.INFO, options: _options }, nestState)
      nestedInstantiatedPlugins.forEach(p => p.info(_options))
      listeners.call('onAfterLog', { outlet: Outlet.INFO, options: _options }, nestState)
    },
    step: _options => {
      listeners.call('onBeforeLog', { outlet: Outlet.STEP, options: _options }, nestState)
      if (!Array.isArray(_options) && typeof _options === 'object' && _options.spinner) {
        const results = nestedInstantiatedPlugins.map(p => p.step(_options)).filter(v => v != null) as StepSpinner[]
        const result: StepSpinner = {
          text: (...args) => results.forEach(r => r.text(...args)),
          color: (...args) => results.forEach(r => r.color(...args)),
          start: (...args) => results.forEach(r => r.start(...args)),
          temporarilyClear: (...args) => results.forEach(r => r.temporarilyClear(...args)),
          pause: (...args) => results.forEach(r => r.pause(...args)),
          destroy: (...args) => results.forEach(r => r.destroy(...args)),
          stopAndPersist: (...args) => results.forEach(r => r.stopAndPersist(...args)),
        }
        listeners.call('onAfterLog', { outlet: Outlet.STEP, options: _options }, nestState)
        return result as any
      }
      else {
        nestedInstantiatedPlugins.forEach(p => p.step(_options))
        listeners.call('onAfterLog', { outlet: Outlet.STEP, options: _options }, nestState)
      }
    },
    success: _options => {
      listeners.call('onBeforeLog', { outlet: Outlet.SUCCESS, options: _options }, nestState)
      nestedInstantiatedPlugins.forEach(p => p.success(_options))
      listeners.call('onAfterLog', { outlet: Outlet.SUCCESS, options: _options }, nestState)
    },
    warn: _options => {
      listeners.call('onBeforeLog', { outlet: Outlet.WARN, options: _options }, nestState)
      nestedInstantiatedPlugins.forEach(p => p.warn(_options))
      listeners.call('onAfterLog', { outlet: Outlet.WARN, options: _options }, nestState)
    },
    table: (data, _options) => {
      listeners.call('onBeforeLog', { outlet: Outlet.TABLE, options: _options, data }, nestState)
      nestedInstantiatedPlugins.forEach(p => p.table(data, _options))
      listeners.call('onAfterLog', { outlet: Outlet.TABLE, options: _options, data }, nestState)
    },
    json: (value, _options) => {
      listeners.call('onBeforeLog', { outlet: Outlet.JSON, options: _options, value }, nestState)
      nestedInstantiatedPlugins.forEach(p => p.json(value, _options))
      listeners.call('onAfterLog', { outlet: Outlet.JSON, options: _options, value }, nestState)
    },
    divider: () => {
      listeners.call('onBeforeLog', { outlet: Outlet.DIVIDER }, nestState)
      nestedInstantiatedPlugins.forEach(p => p.divider())
      listeners.call('onAfterLog', { outlet: Outlet.DIVIDER }, nestState)
    },
    spacer: _options => {
      listeners.call('onBeforeLog', { outlet: Outlet.SPACER, numLines: _options }, nestState)
      nestedInstantiatedPlugins.forEach(p => p.spacer(_options))
      listeners.call('onAfterLog', { outlet: Outlet.SPACER, numLines: _options }, nestState)
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
  TOptions extends VerbaLoggerOptions = VerbaLoggerOptions,
// eslint-disable-next-line arrow-body-style
>(options?: TOptions): VerbaLogger<TOptions, TCode, TData> => {
  const listeners = createListenerStore<keyof VerbaPluginEventHandlers<TCode, TData>, VerbaPluginEventHandlers<TCode, TData>>()
  const instantiatedPlugins = options?.plugins?.map(p => p(options, listeners)) ?? []
  
  return _createVerbaLogger(
    options ?? { },
    instantiatedPlugins,
    listeners,
    {
      code: undefined,
      indent: 0,
      indentationString: '',
    },
  )
}