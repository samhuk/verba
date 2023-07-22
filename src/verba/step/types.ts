import { Spinner, SpinnerOptions } from "../spinner/types"

import { BaseOutletOptions } from "../types"
import { VerbaString } from "../verbaString/types"

export type StepOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
  TSpinner extends boolean | Omit<SpinnerOptions, 'text'> = boolean | Omit<SpinnerOptions, 'text'>
> = VerbaString | (BaseOutletOptions<TCode, TData> & {
  /**
   * If set, the step will show a spinner on the left-hand-side and return
   * a `Spinner` object that can be used to interact with it.
   *
   * May take the value of:
   * * `false` - disable spinner
   * * `true` - show default spinner
   * * `object` (SpinnerOptions) - show spinner and configure its appearance
   * 
   * @example
   * import verba from 'verba'
   *
   * const log = verba()
   * 
   * const main = async () => {
   *   const spinner = log.step({
   *     msg: 'Starting task',
   *     spinner: true
   *   })
   *   await doTask()
   *   spinner.stop()
   *   log.success('Completed task!')
   * }
   *
   * main()
   */
  spinner?: TSpinner
})

export type StepSpinner = Omit<Spinner, 'text'> & {
  /**
   * Updates the text of the spinner.
   * 
   * @param onlyTty Determines whether this will only appear for TTY terminals,
   * (therefore hidden for non-TTY terminals).
   * 
   * Non-TTY terminals do not support terminal animations such as spinners,
   * therefore calls to `text` cause new lines to appear which may result in
   * in a lot of undesirable terminal output. In this case, `onlyTty` can be
   * set to `true` for some or all of the `text` calls, to avoid this.
   */
  text: (newText: VerbaString, onlyTty?: boolean) => void
}

export type StepResult<TStepOptions extends StepOptions = StepOptions> = TStepOptions extends { spinner: any }
  ? TStepOptions['spinner'] extends true | Omit<SpinnerOptions, 'text'>
    ? StepSpinner
    : void
  : void
