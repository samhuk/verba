import { BaseTransportOptions } from './types'
import { VerbaString } from '../../verbaString/types'
import { verbaColorizer } from '../../verbaString'

export type CodeRenderer<TCode extends string | number | undefined = string | number | undefined> = (code: TCode, parentCode: TCode) => VerbaString

export const createCodeRenderer = <TCode extends string | number | undefined>(
  transportOptions: BaseTransportOptions,
): CodeRenderer<TCode> | undefined => {
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
