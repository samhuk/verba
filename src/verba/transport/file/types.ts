import { WriteStream } from 'fs'
import { SimpleOutlet, SimpleOutletPrefixesOptions } from '../../outlet/types'
import { SimpleOutletOverride } from '../base/types'

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

export type FileTransportOptions<
  TCode extends string | number = string | number,
  TData extends any = any
> = {
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
   * Overrides the logging behavior of simple outlets (`info`, `step`, `success`, `warn`).
   * 
   * @example
   * import verba, { fileTransport, normalizeVerbaString } from 'verba'
   * 
   * const transport = fileTransport({
   *   simpleOutletOverrides: {
   *     info: options => console.log('INFO', normalizeVerbaString(options.msg, { disableColors: true })),
   *     step: ...,
   *     ...
   *   }
   * })
   * 
   * const log = verba({ transports: [transport] })
   */
  simpleOutletOverrides?: Partial<{ [outlet in SimpleOutlet]: SimpleOutletOverride<TCode, TData> }>
  /**
   * The method used to batch writes to the log file.
   * 
   * May take the following values:
   * 
   * * `undefined` - No batching
   * 
   * @default undefined
   */
  batchOptions?: FileTransportBatchOptions
  /**
   * Configures the prefixes that appear for each outlet,
   * i.e. `info`, `step`, etc.
   *
   * @example
   * import verba from 'verba'
   * const log = verba({
   *   outletPrefixes: {
   *     info: 'info',
   *     step: f => f.cyan(f.underline('step')),
   *   }
   * })
   */
  outletPrefixes?: SimpleOutletPrefixesOptions
}
