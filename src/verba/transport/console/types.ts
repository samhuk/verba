import { BaseTransportOptions } from '../base/types'
import { DispatchServiceBatchOptions } from '../util/dispatchService/base/types'

export type ConsoleTransportOptions<
  TCode extends string | number | undefined = string | number | undefined,
  TData extends any = any
> = Partial<
  Pick<
    BaseTransportOptions<TCode, TData>,
    'dispatchDeltaT' | 'deltaT' | 'outletPrefixes' | 'dispatchTimePrefix' | 'timePrefix' | 'codeRenderer' | 'dataRenderer' | 'disableColors'
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
}
