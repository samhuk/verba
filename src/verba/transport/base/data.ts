import { BaseTransportOptions } from './types'

export type DataRenderer<TData extends any = any> = (data: TData) => string

export const createDataRenderer = (
  transportOptions: BaseTransportOptions,
  renderJson: (value: any, pretty: boolean) => string,
): DataRenderer | undefined => {
  if (transportOptions.dataRenderer == null || transportOptions.dataRenderer === true)
    return (data: any) => renderJson(data, false)

  if (transportOptions.dataRenderer === false)
    return undefined

  return transportOptions.dataRenderer
}
