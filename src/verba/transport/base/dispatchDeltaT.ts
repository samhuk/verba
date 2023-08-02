import { BaseTransportOptions, DispatchDeltaTOptions } from "./types"

import { Colors } from "../../verbaString/types"
import { ListenerStore } from "../../util/listenerStore/types"
import { MutableRef } from "../../util/types"
import { VerbaTransportEventHandlers } from "../types"
import { createPadder } from "../../util/string"
import { createStringFormatter } from "../../verbaString"

/**
 * Lots of code duplication primarily for absolute fastest performance.
 */
export const useDispatchDeltaTRenderer = (
  transportOptions: BaseTransportOptions,
  colorizer: Colors,
  options: Exclude<DispatchDeltaTOptions, false>,
  previousDispatchEpochRef: MutableRef<number>,
  listeners:  ListenerStore<keyof VerbaTransportEventHandlers, VerbaTransportEventHandlers>,
  renderDispatchDeltaTPos: 'start' | 'end',
): (() => string) => {
  listeners.add('onAfterLog', () => {
    previousDispatchEpochRef.current = Date.now()
  })

  const padder = createPadder(10)

  const defaultColorlessEnd = () => padder(`+${Date.now() - previousDispatchEpochRef.current}ms `)
  const defaultColorlessStart = () => padder(`+${Date.now() - previousDispatchEpochRef.current}ms `)

  if (options === true) {
    return transportOptions.disableColors
      ? renderDispatchDeltaTPos === 'start'
        ? defaultColorlessStart
        : defaultColorlessEnd
      : renderDispatchDeltaTPos === 'start'
        ? () => colorizer.dim(padder(`+${Date.now() - previousDispatchEpochRef.current}ms `))
        : () => '  ' + colorizer.dim(`[+${Date.now() - previousDispatchEpochRef.current} ms]`)
  }

  if (Array.isArray(options)) {
    if (transportOptions.disableColors) {
      return renderDispatchDeltaTPos === 'start'
        ? defaultColorlessStart
        : defaultColorlessEnd
    }

    const formatter = createStringFormatter(options, transportOptions)
    return renderDispatchDeltaTPos === 'start'
      ? () => formatter(padder(`+${Date.now() - previousDispatchEpochRef.current}ms `))
      : () => '  ' + formatter(`[+${Date.now() - previousDispatchEpochRef.current} ms]`)
  }
  
  if (typeof options === 'function')
    return () => options(Date.now() - previousDispatchEpochRef.current, colorizer)

  const formatProp = options.format
  if (formatProp == null) {
    return transportOptions.disableColors
      ? renderDispatchDeltaTPos === 'start'
        ? defaultColorlessStart
        : defaultColorlessEnd
      : renderDispatchDeltaTPos === 'start'
        ? () => colorizer.dim(padder(`+${Date.now() - previousDispatchEpochRef.current}ms `))
        : () => '  ' + colorizer.dim(`[+${Date.now() - previousDispatchEpochRef.current} ms]`)
  }

  if (Array.isArray(formatProp)) {
    if (transportOptions.disableColors) {
      return renderDispatchDeltaTPos === 'start'
        ? defaultColorlessStart
        : defaultColorlessEnd
    }

    const formatter = createStringFormatter(formatProp, transportOptions)
    return renderDispatchDeltaTPos === 'start'
      ? () => formatter(padder(`+${Date.now() - previousDispatchEpochRef.current} ms `))
      : () => '  ' + formatter(`[+${Date.now() - previousDispatchEpochRef.current} ms]`)
  }
  
  return () => formatProp(Date.now() - previousDispatchEpochRef.current, colorizer)
}
