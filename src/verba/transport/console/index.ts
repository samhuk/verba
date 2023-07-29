import { baseTransport } from '../base'
import { VerbaTransport } from '../types'
import { ConsoleTransportOptions } from './types'

export const consoleTransport = <
  TCode extends string | number = string | number,
  TData extends any = any
>(
  options?: ConsoleTransportOptions<TCode, TData>,
): VerbaTransport<TCode, TData> => baseTransport({
  isTty: process.stdout.isTTY,
  dispatch: console.log,
  disableColors: options?.disableColors,
  simpleOutletOverrides: options?.simpleOutletOverrides,
})
