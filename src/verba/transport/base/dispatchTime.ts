import { BaseTransportOptions } from "./types"
import { Colors } from "../../verbaString/types"
import { formatDate } from "../../util/date"

/**
 * Code duplication for super fast performance.
 */
export const createDispatchTimeRenderer = (
  transportOptions: BaseTransportOptions,
  colorizer: Colors,
) => transportOptions.dispatchTimePrefix !== false
  ? transportOptions.dispatchTimePrefix === true
    ? transportOptions.disableColors
      ? () => new Date().toLocaleTimeString() + '  '
      : () => colorizer.dim(new Date().toLocaleTimeString() + '  ')
    : transportOptions.disableColors
      ? () => formatDate(new Date(), transportOptions.dispatchTimePrefix as string) + '  '
      : () => colorizer.dim(formatDate(new Date(), transportOptions.dispatchTimePrefix as string) + '  ')
  : () => ''
