import { VerbaString } from '../../verbaString/types'
import { verbaColorizer } from "../../verbaString"
import { BaseTransportOptions } from './types'

export type CodeRenderer = (code: string | number | undefined, parentCode: string | number | undefined) => VerbaString

export const createCodeRenderer = (
  transportOptions: BaseTransportOptions,
): CodeRenderer | undefined => {
  if (transportOptions.codeRenderer == null || transportOptions.codeRenderer === true) {
    return transportOptions.disableColors
      ? (code, parentCode) => {
        const _code = code ?? parentCode
        return _code != null ? `${_code} ` : ''
      }
      : (code, parentCode) => {
        const _code = code ?? parentCode
        return _code != null ? `${verbaColorizer.magenta(String(_code))} ` : ''
      }
  }

  if (transportOptions.codeRenderer === false)
    return undefined

  return transportOptions.codeRenderer
}
