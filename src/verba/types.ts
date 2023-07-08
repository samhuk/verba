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
  header?: boolean
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

type NestOptions<
  TCode extends string | number = string | number,
> = { indent?: boolean, code?: TCode }

export type VerbaLogger<
  TOptions extends VerbaLoggerOptions = VerbaLoggerOptions,
  TCode extends string | number = string | number,
  TData extends any = any,
> = {
  info: (options: InfoOptions<TCode>) => void
  step: <TStepOptions extends StepOptions<TCode>>(options: TStepOptions) => StepResult<TStepOptions>
  success: (options: SuccessOptions<TCode>) => void
  warn: (options: WarnOptions<TCode>) => void
  error: (options: ErrorOptions<TCode>) => void
  table: (data: any, columns: string[]) => void
  nest: (options: NestOptions<TCode>) => VerbaLogger
}
