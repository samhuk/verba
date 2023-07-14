import { BaseOutletOptions, StepOptions, StepSpinner } from "./types"
import { Spinner, SpinnerOptions } from "./spinner/types"

import { SimpleOutletLoggers } from "./simpleOutletLogger"
import { VerbaString } from "./string/types"
import { createCodeStr } from "./code"
import { createSpinner } from "./spinner"
import { normalizeVerbaString } from "./string"

export const logStepWithSpinner = (
  options: (BaseOutletOptions & {
    spinner?: true | Omit<SpinnerOptions, 'text'>
  }),
  parentCode: string | number | undefined,
  indentation: number,
  indentationString: string,
  onSpinnerDestroy: () => void,
): StepSpinner => {
  const code = options.code ?? parentCode
  const codeStr = createCodeStr(code)
  const msg = Array.isArray(options.msg)
    ? options.msg.map(s => normalizeVerbaString(s)).join(`\n${indentationString}`)
    : normalizeVerbaString(options.msg)

  const spinner = createSpinner(
    typeof options.spinner === 'boolean'
      ? {
        text: codeStr + msg,
        color: 'cyan',
        indentation,
      }
      : {
        ...options.spinner,
        indentation: options.spinner?.indentation ?? indentation,
      },
  )

  return {
    text: s => spinner.text(code != null ? codeStr + normalizeVerbaString(s) : s),
    color: spinner.color,
    start: spinner.start,
    clear: spinner.clear,
    pause: spinner.pause,
    destroy: () => {
      spinner.destroy()
      onSpinnerDestroy()
    },
    stopAndPersist: () => {
      spinner.stopAndPersist()
      onSpinnerDestroy()
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
    clear: () => undefined,
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
    parentCode: string | number | undefined,
    indentation: number,
    indentationString: string,
    simpleOutletLoggers: SimpleOutletLoggers,
    onSpinnerDestroy: () => void,
) => (options: StepOptions, currentSpinner: Spinner | undefined) => {
  if (typeof options === 'object' && options.spinner) {
    if (isTty) {
      currentSpinner?.destroy()
      return logStepWithSpinner(options as any, parentCode, indentation, indentationString, onSpinnerDestroy)
    }

    return createNonTTYSpinnerShim(simpleOutletLoggers, options, indentationString)
  }

  simpleOutletLoggers.step(options, indentationString)
  return undefined as any
}
