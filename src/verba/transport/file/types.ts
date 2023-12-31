import { BaseTransportOptions } from '../base/types'
import { DispatchServiceBatchOptions } from '../util/dispatchService/base/types'
import { WriteStream } from 'fs'

export type FileTransportOutFile = string | WriteStream

export type FileTransportOptions<
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any
> = Partial<
  Pick<
    BaseTransportOptions<TCode, TData>,
    'deltaT' | 'outletPrefixes' | 'timePrefix' | 'codeRenderer' | 'dataRenderer' | 'prefix'
  >
> & {
  /**
   * File to output log messages to. This may take the value of a path or an `fs.WriteStream`.
   * 
   * @default './log.txt'
   * 
   * @example
   * 'log.txt' // Path
   * fs.createWriteStream('log.txt', {flags : 'w'}) // Stream
   */
  outFile?: FileTransportOutFile
  /**
   * Optional configuration for the batching of log messages.
   * 
   * This can take the following values:
   * 
   * * `undefined` - No batching
   * * `{ age: number, size: number }`
   * 
   * @default undefined // No batching
   */
  batchOptions?: DispatchServiceBatchOptions
}
