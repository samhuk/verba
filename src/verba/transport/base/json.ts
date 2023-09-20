import stringify from 'safe-stable-stringify'
import { Colors } from '../../verbaString/types'

export const createJsonRenderer = (colorizer: Colors) => (value: any, pretty: boolean): string => {
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
