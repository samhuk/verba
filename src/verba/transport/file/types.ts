import { BaseTransportOptions } from '../base/types'
import { WriteStream } from 'fs'

export type FileTransportOutFile = string | WriteStream

/**
 * Options to configure the batching behavior of the File Transport.
 */
export type FileTransportBatchOptions = {
  /**
   * The maximum age of batches (how long between each batch).
   */
  age?: number
  /**
   * The maximum size of batches (number of log messages within them).
   */
  size?: number
}

export type CloseNotifier = { close: () => Promise<void[]>, register: (fn: () => Promise<void>) => void }

export type FileTransportOptions<
  TCode extends string | number = string | number,
  TData extends any = any
> = Partial<Pick<BaseTransportOptions<TCode, TData>, 'dispatchDeltaT' | 'outletPrefixes' | 'simpleOutletOverrides' | 'dispatchTimePrefix'>> & {
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
   * Optional configuration for the batching of log messages to the write stream.
   * 
   * May take the following values:
   * 
   * * `undefined` - No batching
   * * `{ age: number, size: number }`
   * 
   * @default undefined // No batching
   */
  batchOptions?: FileTransportBatchOptions
}
