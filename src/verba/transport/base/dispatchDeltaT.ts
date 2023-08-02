import { BaseTransportOptions, DispatchDeltaTOptions } from "./types"

import { Colors } from "../../verbaString/types"
import { ListenerStore } from "../../util/listenerStore/types"
import { MutableRef } from "../../util/types"
import { VerbaTransportEventHandlers } from "../types"
import { createPadder } from "../../util/string"
import { createStringFormatter } from "../../verbaString"
import { useRef } from "../../util/misc"

export type DispatchDeltaT = {
  render: () => string
  position: 'start' | 'end'
}

const determineDispatchDeltaTPos = (dispatchDeltaTOptions: DispatchDeltaTOptions): 'start' | 'end' => (
  typeof dispatchDeltaTOptions === 'object' && !Array.isArray(dispatchDeltaTOptions)
    ? dispatchDeltaTOptions.position ?? 'end'
      : 'end'
)

/**
 * Lots of code duplication for super fast performance.
 */
const createDispatchDeltaTRenderer = (
  dispatchDeltaTOptions: Exclude<BaseTransportOptions['dispatchDeltaT'], false | null>,
  disableColors: boolean,
  colorizer: Colors,
  previousDispatchEpochRef: MutableRef<number>,
  pos: 'start' | 'end',
) => {
  const padder = createPadder(10)

  const defaultColorlessEnd = () => padder(`+${Date.now() - previousDispatchEpochRef.current}ms `)
  const defaultColorlessStart = () => padder(`+${Date.now() - previousDispatchEpochRef.current}ms `)

  if (dispatchDeltaTOptions === true) {
    return disableColors
      ? pos === 'start'
        ? defaultColorlessStart
        : defaultColorlessEnd
      : pos === 'start'
        ? () => colorizer.dim(padder(`+${Date.now() - previousDispatchEpochRef.current}ms `))
        : () => '  ' + colorizer.dim(`[+${Date.now() - previousDispatchEpochRef.current} ms]`)
  }

  if (Array.isArray(dispatchDeltaTOptions)) {
    if (disableColors) {
      return pos === 'start'
        ? defaultColorlessStart
        : defaultColorlessEnd
    }

    const formatter = createStringFormatter(dispatchDeltaTOptions, { disableColors })
    return pos === 'start'
      ? () => formatter(padder(`+${Date.now() - previousDispatchEpochRef.current}ms `))
      : () => '  ' + formatter(`[+${Date.now() - previousDispatchEpochRef.current} ms]`)
  }
  
  if (typeof dispatchDeltaTOptions === 'function')
    return () => (dispatchDeltaTOptions as Extract<DispatchDeltaTOptions, Function>)(Date.now() - previousDispatchEpochRef.current, colorizer)

  const formatProp = dispatchDeltaTOptions.format
  if (formatProp == null) {
    return disableColors
      ? pos === 'start'
        ? defaultColorlessStart
        : defaultColorlessEnd
      : pos === 'start'
        ? () => colorizer.dim(padder(`+${Date.now() - previousDispatchEpochRef.current}ms `))
        : () => '  ' + colorizer.dim(`[+${Date.now() - previousDispatchEpochRef.current} ms]`)
  }

  if (Array.isArray(formatProp)) {
    if (disableColors) {
      return pos === 'start'
        ? defaultColorlessStart
        : defaultColorlessEnd
    }

    const formatter = createStringFormatter(formatProp, { disableColors })
    return pos === 'start'
      ? () => formatter(padder(`+${Date.now() - previousDispatchEpochRef.current} ms `))
      : () => '  ' + formatter(`[+${Date.now() - previousDispatchEpochRef.current} ms]`)
  }

  return () => formatProp(Date.now() - previousDispatchEpochRef.current, colorizer)
}

export const useDispatchDeltaT = (
  transportOptions: BaseTransportOptions,
  colorizer: Colors,
  listeners:  ListenerStore<keyof VerbaTransportEventHandlers, VerbaTransportEventHandlers>,
): DispatchDeltaT | undefined => {
  if (transportOptions.dispatchDeltaT === false || transportOptions.dispatchDeltaT == null)
    return undefined

  const previousDispatchEpochRef = useRef(Date.now())

  listeners.add('onAfterLog', () => {
    previousDispatchEpochRef.current = Date.now()
  })
  
  const pos = determineDispatchDeltaTPos(transportOptions.dispatchDeltaT)
  return {
    render: createDispatchDeltaTRenderer(transportOptions.dispatchDeltaT, transportOptions.disableColors, colorizer, previousDispatchEpochRef, pos),
    position: pos,
  }
}
