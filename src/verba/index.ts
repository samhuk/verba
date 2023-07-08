import { VerbaLogger, VerbaLoggerOptions } from './types'

export const createVerbaLogger = <
  TCode extends string | number = string | number,
  TData extends any = any,
  TOptions extends VerbaLoggerOptions = VerbaLoggerOptions,
>(options?: TOptions): VerbaLogger<TOptions, TCode, TData> => {
  return {
    info: _options => undefined,
    step: _options => undefined,
    warn: _options => undefined,
    error: _options => undefined,
    spinner: _options => undefined,
    table: _options => undefined,
    nest: _options => undefined,
  }
}
