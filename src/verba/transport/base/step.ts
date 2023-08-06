import { NormalizedStepOptions, StepSpinner } from "../../step/types"
import { SpinnerOptions } from "../../spinner/types"
import { normalizeVerbaString } from "../../verbaString"

import { MutableRef } from "../../util/types"
import { NestState } from "../../types"
import { NormalizedSimpleOutletOptions, SimpleOutletOptions } from "../../outlet/types"
import { VerbaString } from "../../verbaString/types"
import { createConsoleSpinner } from "./spinner"
import { BaseTransportOptions } from './types'
import { TtyConsoleOccupier } from "./ttyConsoleOccupier"
import { CodeRenderer } from './code'

const createStepSpinner = (
  transportOptions: BaseTransportOptions | undefined,
  options: (Exclude<SimpleOutletOptions, VerbaString> & {
    spinner?: true | Omit<SpinnerOptions, 'text'>
  }),
  nestState: NestState,
  ttyConsoleOccupierRef: MutableRef<TtyConsoleOccupier | undefined>,
  renderCode: CodeRenderer | undefined,
  renderDispatchTime: () => string,
): { stepSpinner: StepSpinner, clear: () => void } => {
  // -- Prepare variables
  const codeStr = renderCode != null
    ? normalizeVerbaString(renderCode(options.code, nestState.code), transportOptions)
    : ''
  const msg = normalizeVerbaString(options.msg, transportOptions)
  // -- Create spinner
  const spinner = createConsoleSpinner(
    typeof options.spinner === 'boolean'
      ? {
        text: codeStr + msg,
        color: transportOptions?.disableColors ? undefined : 'cyan',
        indentation: nestState.indent,
        disableColors: transportOptions?.disableColors,
        renderPrefix: renderDispatchTime,
      }
      : {
        ...options.spinner,
        indentation: options.spinner?.indentation ?? nestState.indent,
        disableColors: transportOptions?.disableColors,
        renderPrefix: renderDispatchTime,
      },
  )
  // -- Prepare text setter function
  const setText: StepSpinner['text'] = codeStr != ''
    ? (s => spinner.text(codeStr + normalizeVerbaString(s, transportOptions)))
    : s => spinner.text(s)

  return {
    stepSpinner: {
      text: setText,
      color: spinner.color,
      start: spinner.start,
      pause: spinner.pause,
      destroy: () => {
        spinner.destroy()
        ttyConsoleOccupierRef.current = undefined
      },
      stopAndPersist: () => {
        spinner.stopAndPersist()
        ttyConsoleOccupierRef.current = undefined
      },
    },
    clear: spinner.destroy,
  }
}

const createNonTTYSpinnerShim = (
  stepSimpleOutletLogger: (options: NormalizedSimpleOutletOptions) => void,
  options: NormalizedStepOptions,
): StepSpinner => {
  // When stdout is not TTY, then spinner functionality is not possible.
  // Therefore we log the initial message, and then return a step spinner shim.
  stepSimpleOutletLogger(options)
  return {
    start: () => stepSimpleOutletLogger(options),
    color: () => undefined,
    destroy: () => undefined,
    pause: () => undefined,
    stopAndPersist: () => undefined,
    text: (s, onlyTty) => onlyTty
      ? undefined
      : stepSimpleOutletLogger({ ...options, msg: s }),
  }
}

const createTtyConsoleOccupier = (
  options: NormalizedStepOptions,
  stepSpinner: StepSpinner,
  clearStepSpinner: () => void,
  stepSimpleOutletLogger: (options: NormalizedSimpleOutletOptions) => void,
): TtyConsoleOccupier => {
  let hasBeenInterruptedByOtherLog = false
  let isInterrupted = false
  return{
    destroy: stepSpinner.destroy,
    interrupt: (typeof options.spinner === 'boolean' || (options.spinner?.persistInitialTextAsStepLogUponOtherLog ?? true))
      ? () => {
        isInterrupted = true
        clearStepSpinner()

        if (!hasBeenInterruptedByOtherLog) {
          hasBeenInterruptedByOtherLog = true
          stepSimpleOutletLogger(options)
        }
      }
      : () => {
        isInterrupted = true
        clearStepSpinner()
      },
    resume: () => {
      if (isInterrupted) {
        isInterrupted = false
        stepSpinner.start()
      }
    },
  }
}

export const useStepLogger = (
  transportOptions: BaseTransportOptions,
  nestState: NestState,
  stepSimpleOutletLogger: (options: NormalizedSimpleOutletOptions) => void,
  ttyConsoleOccupierRef: MutableRef<TtyConsoleOccupier | undefined>,
  renderCode: CodeRenderer | undefined,
  renderDispatchTime: () => string,
) => (options: NormalizedStepOptions): StepSpinner | void => {
  // If options does not have a truthy `spinner` prop, then do normal step log
  if (!options.spinner)
    return stepSimpleOutletLogger(options)
    
  // Else if the current console is *not* TTY, then do fake spinner
  else if (!transportOptions.isTty)
    return createNonTTYSpinnerShim(stepSimpleOutletLogger, options)

  // Else (if the current console is TTY) then do real spinner
  // eslint-disable-next-line max-len
  const { stepSpinner, clear: clearStepSpinner } = createStepSpinner(transportOptions, options as any, nestState, ttyConsoleOccupierRef, renderCode, renderDispatchTime)
  ttyConsoleOccupierRef.current = createTtyConsoleOccupier(options, stepSpinner, clearStepSpinner, stepSimpleOutletLogger)
  return stepSpinner
}
