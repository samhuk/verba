import { Spinner } from "../../spinner/types"
import { normalizeVerbaString } from "../../verbaString"

import { MutableRef } from "../../util/types"
import { NestState, OutletSpinner } from "../../types"
import { NormalizedSimpleOutletOptions, NormalizedSpinnerOptions } from "../../outlet/types"
import { BaseTransportOptions } from './types'
import { TtyConsoleOccupier } from "./ttyConsoleOccupier"
import { CodeRenderer } from './code'
import { createConsoleSpinner } from '../../spinner'
import { VerbaString } from '../../verbaString/types'

const createSpinner = (
  transportOptions: BaseTransportOptions | undefined,
  ttyConsoleOccupierRef: MutableRef<TtyConsoleOccupier | undefined>,
  nestState: NestState,
  renderCode: CodeRenderer | undefined,
  renderDispatchTime: () => string,
  options: NormalizedSpinnerOptions | undefined,
): { spinner: OutletSpinner, clear: () => void } => {
  // -- Prepare variables
  const codeStr = renderCode != null
    ? normalizeVerbaString(renderCode(options?.code, nestState.code), transportOptions)
    : null
  const initialText = options?.text != null ? normalizeVerbaString(options.text, transportOptions) : ''
  // -- Create console spinner
  const spinner = createConsoleSpinner({
    text: (codeStr ?? '') + initialText,
    color: transportOptions?.disableColors ? undefined : 'cyan',
    indentation: nestState.indent,
    disableColors: transportOptions?.disableColors,
    renderPrefix: renderDispatchTime,
  })

  // -- Prepare text setter function
  const setText: Spinner['text'] = codeStr != null
    ? s => spinner.text(codeStr + normalizeVerbaString(s, transportOptions))
    : s => spinner.text(s)

  return {
    spinner: {
      text: setText,
      color: spinner.color,
      start: spinner.start,
      pause: spinner.pause,
      clear: () => {
        spinner.clear()
        ttyConsoleOccupierRef.current = undefined
      },
      persist: () => {
        spinner.persist()
        ttyConsoleOccupierRef.current = undefined
      },
    },
    clear: spinner.clear,
  }
}

const createTtyConsoleOccupier = (
  spinner: Spinner,
  clearSpinner: () => void,
  stepSimpleOutletLogger: (options: NormalizedSimpleOutletOptions) => void,
  options: NormalizedSpinnerOptions | undefined,
): TtyConsoleOccupier => {
  let hasBeenInterruptedByOtherLog = false
  let isInterrupted = false
  const baseInterrupt = () => {
    isInterrupted = true
    clearSpinner()
  }

  return{
    destroy: spinner.clear,
    interrupt: (options?.persistInitialTextAsStepLogUponOtherLog ?? true) && options?.text != null
      ? () => {
        baseInterrupt()

        if (!hasBeenInterruptedByOtherLog) {
          hasBeenInterruptedByOtherLog = true
          stepSimpleOutletLogger({
            msg: options.text,
            code: options.code,
            data: options.data,
          })
        }
      }
      : baseInterrupt,
    resume: () => {
      if (isInterrupted) {
        isInterrupted = false
        spinner.start()
      }
    },
  }
}

const createNonTTYSpinnerShim = (
  stepSimpleOutletLogger: (options: NormalizedSimpleOutletOptions) => void,
  options: NormalizedSpinnerOptions | undefined,
): OutletSpinner => {
  const stepShim = (text: VerbaString | undefined) => {
    if (text == null)
      return
    
    stepSimpleOutletLogger({
      msg: text,
      code: options?.code,
      data: options?.data,
    })
  }

  // Log the initial text as a step outlet
  if (!(options?.disableAutoStart ?? false))
    stepShim(options?.text)

  // Spinner shim, using step outlet
  return {
    start: () => stepShim(options?.text),
    color: () => undefined,
    clear: () => undefined,
    pause: () => undefined,
    persist: () => undefined,
    text: (newText, onlyTty) => onlyTty
      ? undefined
      : stepShim(newText),
  }
}

export const useSpinnerLogger = (
  transportOptions: BaseTransportOptions,
  ttyConsoleOccupierRef: MutableRef<TtyConsoleOccupier | undefined>,
  nestState: NestState,
  stepSimpleOutletLogger: (options: NormalizedSimpleOutletOptions) => void,
  renderCode: CodeRenderer | undefined,
  renderDispatchTime: () => string,
) => (options: NormalizedSpinnerOptions): OutletSpinner => {
  // If the current console is not TTY then return spinner shim
  if (!transportOptions.isTty)
    return createNonTTYSpinnerShim(stepSimpleOutletLogger, options)

  // Else return real spinner
  const { spinner, clear } = createSpinner(transportOptions, ttyConsoleOccupierRef, nestState, renderCode, renderDispatchTime, options as any)
  ttyConsoleOccupierRef.current = createTtyConsoleOccupier(spinner, clear, stepSimpleOutletLogger, options)
  return spinner
}
