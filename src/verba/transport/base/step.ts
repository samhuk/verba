import { NormalizedStepOptions, StepSpinner } from "../../step/types"
import { SpinnerOptions } from "../../spinner/types"
import { normalizeVerbaString } from "../../verbaString"

import { MutableRef } from "../../util/types"
import { NestState } from "../../types"
import { SimpleOutletLoggers } from "./simpleOutletLogger"
import { SimpleOutletOptions } from "../../outlet/types"
import { VerbaString } from "../../verbaString/types"
import { createCodeStr } from "./code"
import { createConsoleSpinner } from "./spinner"
import { BaseTransportOptions, TtyConsoleOccupier } from './types'

const createStepSpinner = (
  transportOptions: BaseTransportOptions | undefined,
  options: (Exclude<SimpleOutletOptions, VerbaString> & {
    spinner?: true | Omit<SpinnerOptions, 'text'>
  }),
  nestState: NestState,
  ttyConsoleOccupierRef: MutableRef<TtyConsoleOccupier | undefined>,
): StepSpinner => {
  const code = options.code === null ? undefined : (options.code ?? nestState.code)
  const codeStr = code != null
    ? createCodeStr(code, transportOptions)
    : ''
  const msg = normalizeVerbaString(options.msg, transportOptions)

  const spinner = createConsoleSpinner(
    typeof options.spinner === 'boolean'
      ? {
        text: codeStr + msg,
        color: transportOptions?.disableColors ? undefined : 'cyan',
        indentation: nestState.indent,
        disableColors: transportOptions?.disableColors,
      }
      : {
        ...options.spinner,
        indentation: options.spinner?.indentation ?? nestState.indent,
        disableColors: transportOptions?.disableColors,
      },
  )

  const setText: StepSpinner['text'] = codeStr != ''
    ? (s => spinner.text(codeStr + normalizeVerbaString(s, transportOptions)))
    : s => spinner.text(s)

  return {
    text: setText,
    color: spinner.color,
    start: spinner.start,
    temporarilyClear: spinner.temporarilyClear,
    pause: spinner.pause,
    destroy: () => {
      spinner.destroy()
      ttyConsoleOccupierRef.current = undefined
    },
    stopAndPersist: () => {
      spinner.stopAndPersist()
      ttyConsoleOccupierRef.current = undefined
    },
  }
}

const createNonTTYSpinnerShim = (
  stepSimpleOutletLoggers: SimpleOutletLoggers['step'],
  options: NormalizedStepOptions,
): StepSpinner => {
  // When stdout is not TTY, then spinner functionality is not possible.
  // Therefore we log the initial message, and then return a step spinner shim.
  stepSimpleOutletLoggers(options)
  return {
    start: () => stepSimpleOutletLoggers(options),
    color: () => undefined,
    temporarilyClear: () => undefined,
    destroy: () => undefined,
    pause: () => undefined,
    stopAndPersist: () => undefined,
    text: (s, onlyTty) => onlyTty
      ? undefined
      : stepSimpleOutletLoggers({ ...options, msg: s }),
  }
}

const createTtyConsoleOccupierFromStepSpinner = (
  options: NormalizedStepOptions,
  stepSpinner: StepSpinner,
  stepSimpleOutletLoggers: SimpleOutletLoggers['step'],
): TtyConsoleOccupier => {
  let hasBeenInterruptedByOtherLog = false

 return{
    destroy: stepSpinner.destroy,
    onInterruptedByOtherLog: (typeof options.spinner === 'boolean' || (options.spinner?.persistInitialTextAsStepLogUponOtherLog ?? true))
      ? () => {
        stepSpinner.temporarilyClear()
        if (!hasBeenInterruptedByOtherLog) {
          hasBeenInterruptedByOtherLog = true
          stepSimpleOutletLoggers(options)
        }
      }
      : () => stepSpinner.temporarilyClear(),
  }
}

export const createStepLogger = (
  transportOptions: BaseTransportOptions | undefined,
  isTty: boolean,
  nestState: NestState,
  stepSimpleOutletLogger: SimpleOutletLoggers['step'],
  ttyConsoleOccupierRef: MutableRef<TtyConsoleOccupier | undefined>,
) => (options: NormalizedStepOptions): StepSpinner | void => {
  // If the options has a truthy `spinner` prop, then do spinner
  if (options.spinner) {
    // If the current console is TTY, then do real spinner
    if (isTty) {
      ttyConsoleOccupierRef.current?.destroy()
      const stepSpinner = createStepSpinner(transportOptions, options as any, nestState, ttyConsoleOccupierRef)
      ttyConsoleOccupierRef.current = createTtyConsoleOccupierFromStepSpinner(options, stepSpinner, stepSimpleOutletLogger)
      return stepSpinner
    }

    // Else (current console is not TTY), then do fake spinner
    ttyConsoleOccupierRef.current = undefined
    return createNonTTYSpinnerShim(stepSimpleOutletLogger, options)
  }

  // Else (options does not have a truthy `spinner` prop), then do normal step log
  stepSimpleOutletLogger(options)
}
