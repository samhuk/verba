import { VerbaColorizer } from '../../verbaString/types'
import stringify from 'safe-stable-stringify'

export const createJsonRenderer = (colorizer: VerbaColorizer) => (value: any, pretty: boolean): string => {
  if (value != null) {
    if (typeof value === 'object') {
      const stringified = stringify(value, null, pretty ? 2 : 0)
      return stringified != null
        ? stringified != '{}'
          ? stringified
          : ''
        : colorizer.grey(String(value))
    }
    return String(value)
  }
  return ''
}
