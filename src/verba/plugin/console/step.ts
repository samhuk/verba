import { BaseOutletOptions, NestState } from "../../types"
import { Spinner, SpinnerOptions } from "../../spinner/types"
import { StepOptions, StepSpinner } from "../../step/types"
import { isVerbaString, normalizeVerbaString } from "../../verbaString"

import { MutableRef } from "../../util/types"
import { SimpleOutletLoggers } from "./simpleOutletLogger"
import { VerbaString } from "../../verbaString/types"
import { createCodeStr } from "../../code"
import { createConsoleSpinner } from "../../spinner"

export const logStepWithSpinner = (
  options: (BaseOutletOptions & {
    spinner?: true | Omit<SpinnerOptions, 'text'>
  }),
  nestState: NestState,
  spinnerRef: MutableRef<Spinner | undefined>,
): StepSpinner => {
  const code = options.code === null ? undefined : (options.code ?? nestState.code)
  const codeStr = createCodeStr(code)
  const msg = Array.isArray(options.msg)
    ? options.msg.map(s => normalizeVerbaString(s)).join(`\n${nestState.indentationString}`)
    : normalizeVerbaString(options.msg)

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

export const createNonTTYSpinnerShim = (
  simpleOutletLoggers: SimpleOutletLoggers,
  options: Exclude<StepOptions, VerbaString>,
  indentationString: string,
) => {
  // When stdout is not TTY, then spinner functionality is not possible.
  // Therefore we log the initial message, and depending 
  simpleOutletLoggers.step(options, indentationString)
  return {
    start: () => simpleOutletLoggers.step(options, indentationString),
    color: () => undefined,
    temporarilyClear: () => undefined,
    destroy: () => undefined,
    pause: () => undefined,
    stopAndPersist: () => undefined,
    text: (s, onlyTty) => onlyTty
      ? undefined
      : simpleOutletLoggers.step({ ...options, msg: s }, indentationString),
  } as StepSpinner
}

export const createStepOutputLogger = (
    isTty: boolean,
    nestState: NestState,
    simpleOutletLoggers: SimpleOutletLoggers,
    spinnerRef: MutableRef<Spinner | undefined>,
) => (options: StepOptions): StepSpinner | void => {
  if (!isVerbaString(options) && options.spinner) {
    if (isTty) {
      spinnerRef.current?.destroy()
      return spinnerRef.current = logStepWithSpinner(options as any, nestState, spinnerRef)
    }

    return spinnerRef.current = createNonTTYSpinnerShim(simpleOutletLoggers, options, nestState.indentationString)
  }

  simpleOutletLoggers.step(options, nestState.indentationString)
}
