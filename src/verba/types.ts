import { Spinner, SpinnerOptions } from './spinner/types'

import { VerbaString } from './string/types'

export type VerbaLoggerOptions = {

}

type BaseOutletOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  msg: VerbaString | VerbaString[]
  data?: TData
  code?: TCode
}

type InfoOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = VerbaString | BaseOutletOptions<TCode, TData>

type StepOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = VerbaString | (BaseOutletOptions<TCode, TData> & {
  spinner?: boolean | SpinnerOptions
})

type StepResult<TStepOptions extends StepOptions = StepOptions> = TStepOptions extends { spinner: any }
  ? TStepOptions['spinner'] extends true | SpinnerOptions
    ? Spinner
    : void
  : void

type SuccessOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = VerbaString | BaseOutletOptions<TCode, TData>

type WarnOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = VerbaString | BaseOutletOptions<TCode, TData>

type ErrorOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = VerbaString | BaseOutletOptions<TCode, TData>

export type AnyOutletOptions<
  TCode extends string | number = string | number,
  TData extends any = any,
> = InfoOptions<TCode, TData>
  | StepOptions<TCode, TData>
  | SuccessOptions<TCode, TData>
  | WarnOptions<TCode, TData>
  | ErrorOptions<TCode, TData>

export type NestOptions<
  TCode extends string | number = string | number,
> = { indent?: number, code?: TCode }

export type VerbaLogger<
  TOptions extends VerbaLoggerOptions = VerbaLoggerOptions,
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  log: (msg: VerbaString) => void
  info: (options: InfoOptions<TCode>) => void
  step: <TStepOptions extends StepOptions<TCode>>(options: TStepOptions) => StepResult<TStepOptions>
  success: (options: SuccessOptions<TCode>) => void
  warn: (options: WarnOptions<TCode>) => void
  error: (options: ErrorOptions<TCode>) => void
  table: (data: any, columns: string[]) => void
  nest: (options: NestOptions<TCode>) => VerbaLogger<TOptions, TCode, TData>
  spacer: (numLines?: number) => void
  divider: () => void
}
