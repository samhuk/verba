import { BaseTransportOptions } from './types'
import { Colors } from '../../verbaString/types'
import { formatDate } from '../../util/date'

/**
 * Code duplication for super fast performance.
 */
export const createDispatchTimeRenderer = (
  transportOptions: BaseTransportOptions,
  colorizer: Colors,
) => transportOptions.timePrefix !== false
  ? transportOptions.timePrefix === true
    ? transportOptions.disableColors
      ? () => new Date().toLocaleTimeString() + '  '
      : () => colorizer.grey(new Date().toLocaleTimeString()) + '  '
    : transportOptions.disableColors
      ? () => formatDate(new Date(), transportOptions.timePrefix as string) + '  '
      : () => colorizer.grey(formatDate(new Date(), transportOptions.timePrefix as string)) + '  '
  : () => ''
