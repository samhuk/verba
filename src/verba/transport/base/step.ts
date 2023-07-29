import { NormalizedStepOptions, StepSpinner } from "../../step/types"
import { Spinner, SpinnerOptions } from "../../spinner/types"
import { isVerbaString, normalizeVerbaString } from "../../verbaString"

import { MutableRef } from "../../util/types"
import { NestState } from "../../types"
import { SimpleOutletLoggers } from "./simpleOutletLogger"
import { SimpleOutletOptions } from "../../outlet/types"
import { VerbaString } from "../../verbaString/types"
import { createCodeStr } from "./code"
import { createConsoleSpinner } from "./spinner"
import { BaseTransportOptions } from './types'

const logStepWithSpinner = (
  transportOptions: BaseTransportOptions | undefined,
  options: (Exclude<SimpleOutletOptions, VerbaString> & {
    spinner?: true | Omit<SpinnerOptions, 'text'>
  }),
  nestState: NestState,
  spinnerRef: MutableRef<Spinner | undefined>,
): StepSpinner => {
  const code = options.code === null ? undefined : (options.code ?? nestState.code)
  const codeStr = createCodeStr(code, transportOptions)
  const msg = normalizeVerbaString(options.msg, transportOptions)

  const spinner = createConsoleSpinner(
    typeof options.spinner === 'boolean'
      ? {
        text: codeStr + msg,
        color: transportOptions?.disableColors ? undefined : 'cyan',
        indentation: nestState.indent,
      }
      : {
        ...options.spinner,
        indentation: options.spinner?.indentation ?? nestState.indent,
      },
  )

  const setText: StepSpinner['text'] = s => code != null
    ? spinner.text(codeStr + normalizeVerbaString(s, transportOptions))
    : spinner.text(s)

  return {
    text: setText,
    color: spinner.color,
    start: spinner.start,
    temporarilyClear: spinner.temporarilyClear,
    pause: spinner.pause,
    destroy: () => {
      spinner.destroy()
      spinnerRef.current = undefined
    },
    stopAndPersist: () => {
      spinner.stopAndPersist()
      spinnerRef.current = undefined
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

export const createStepOutputLogger = (
  transportOptions: BaseTransportOptions | undefined,
  isTty: boolean,
  nestState: NestState,
  stepSimpleOutletLoggers: SimpleOutletLoggers['step'],
  spinnerRef: MutableRef<Spinner | undefined>,
) => (options: NormalizedStepOptions): StepSpinner | void => {
  // If the options is an object with a truthy `spinner` prop, then do spinner
  if (!isVerbaString(options) && options.spinner) {
    // If the current console is TTY, then do real spinner
    if (isTty) {
      spinnerRef.current?.destroy()
      return spinnerRef.current = logStepWithSpinner(transportOptions, options as any, nestState, spinnerRef)
    }
    // Else (current console is not TTY), then do fake spinner
    return spinnerRef.current = createNonTTYSpinnerShim(stepSimpleOutletLoggers, options)
  }

  // Else (options is not truthy spinner), log normal step
  stepSimpleOutletLoggers(options)
}
