import { NestState, SimpleOutletOptions } from "../../types"
import { NormalizedStepOptions, StepSpinner } from "../../step/types"
import { Spinner, SpinnerOptions } from "../../spinner/types"
import { isVerbaString, normalizeVerbaString } from "../../verbaString"

import { MutableRef } from "../../util/types"
import { SimpleOutletLoggers } from "./simpleOutletLogger"
import { VerbaString } from "../../verbaString/types"
import { createCodeStr } from "./code"
import { createConsoleSpinner } from "./spinner"

const logStepWithSpinner = (
  options: (Exclude<SimpleOutletOptions, VerbaString> & {
    spinner?: true | Omit<SpinnerOptions, 'text'>
  }),
  nestState: NestState,
  spinnerRef: MutableRef<Spinner | undefined>,
): StepSpinner => {
  const code = options.code === null ? undefined : (options.code ?? nestState.code)
  const codeStr = createCodeStr(code)
  const msg = normalizeVerbaString(options.msg)

  const spinner = createConsoleSpinner(
    typeof options.spinner === 'boolean'
      ? {
        text: codeStr + msg,
        color: 'cyan',
        indentation: nestState.indent,
      }
      : {
        ...options.spinner,
        indentation: options.spinner?.indentation ?? nestState.indent,
      },
  )

  return {
    text: s => spinner.text(code != null ? codeStr + normalizeVerbaString(s) : s),
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
  indentationString: string,
) => {
  // When stdout is not TTY, then spinner functionality is not possible.
  // Therefore we log the initial message, and then return a step spinner shim.
  stepSimpleOutletLoggers(options, indentationString)
  return {
    start: () => stepSimpleOutletLoggers(options, indentationString),
    color: () => undefined,
    temporarilyClear: () => undefined,
    destroy: () => undefined,
    pause: () => undefined,
    stopAndPersist: () => undefined,
    text: (s, onlyTty) => onlyTty
      ? undefined
      : stepSimpleOutletLoggers({ ...options, msg: s }, indentationString),
  } as StepSpinner
}

export const createStepOutputLogger = (
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
      return spinnerRef.current = logStepWithSpinner(options as any, nestState, spinnerRef)
    }
    // Else (current console is not TTY), then do fake spinner
    return spinnerRef.current = createNonTTYSpinnerShim(stepSimpleOutletLoggers, options, nestState.indentationString)
  }

  // Else (options is not truthy spinner), log normal step
  stepSimpleOutletLoggers(options, nestState.indentationString)
}
