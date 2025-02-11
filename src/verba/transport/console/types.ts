import { BaseTransportOptions } from '../base/types'
import { DispatchServiceBatchOptions } from '../util/dispatchService/types'

export type VerbaWriteStream = { write: (s: string, onComplete?: (err: any) => void) => void, close?: (onComplete?: (err: any) => void) => void }

export type ConsoleTransportOptions<
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any
> = Partial<
  Pick<
    BaseTransportOptions<TCode, TData>,
    | 'deltaT'
    | 'outletPrefixes'
    | 'timePrefix'
    | 'codeRenderer'
    | 'dataRenderer'
    | 'disableColors'
    | 'prefix'
  >
> & {
  /**
   * Optional configuration for the batching of log messages.
   * 
   * **Warning:** Specifying any kind of batching behavior will disable any TTY-dependant
   * behavior such as spinners or progress bars. Non-TTY alternatives for them will be
   * used instead where possible.
   * 
   * This can take the following values:
   * 
   * * `undefined` - No batching
   * * `{ age: number, size: number }`
   * 
   * @default undefined // No batching
   */
  batchOptions?: DispatchServiceBatchOptions
  /**
   * The write stream to use to write log messages to.
   * 
   * @default process.stdout
   */
  stream?: VerbaWriteStream
  /**
   * The separator between log messages.
   * 
   * This can be useful to override if you wish to use `console.log` instead of `process.stdout`, where the former
   * appends `'\n'`, but the latter does not.
   * 
   * @default '\n'
   */
  separator?: string
}
