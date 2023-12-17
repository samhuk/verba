import { BaseTransportOptions, DispatchTimePrefixOptions } from './types'

import { createStringFormatter } from '../../verbaString'
import { formatDate } from '../../util/date'

const DEFAULT_OPTIONS: Required<Extract<BaseTransportOptions['timePrefix'], DispatchTimePrefixOptions>> = {
  dateTimeFormat: 'MMM dd hh:ii:ss',
  stringFormats: ['grey'],
}

const parseOptions = (
  timePrefix: BaseTransportOptions['timePrefix'],
): Required<Extract<BaseTransportOptions['timePrefix'], DispatchTimePrefixOptions>> | undefined => {
  if (typeof timePrefix == null || timePrefix === false)
    return undefined

  if (timePrefix === true)
    return DEFAULT_OPTIONS

  if (typeof timePrefix === 'string') {
    return {
      dateTimeFormat: timePrefix,
      stringFormats: DEFAULT_OPTIONS.stringFormats,
    }
  }

  return {
    dateTimeFormat: timePrefix.dateTimeFormat ?? DEFAULT_OPTIONS.dateTimeFormat,
    stringFormats: timePrefix.stringFormats ?? DEFAULT_OPTIONS.stringFormats,
  }
}

/**
 * Code duplication for super fast performance.
 */
export const createDispatchTimeRenderer = (
  transportOptions: BaseTransportOptions,
): (() => string) => {
  const options = parseOptions(transportOptions.timePrefix)

  if (options === undefined)
    return () => ''

  if (transportOptions.disableColors)
    return () => formatDate(new Date(), options.dateTimeFormat) + '  '

  const stringFormatter = createStringFormatter(options.stringFormats)
  return () => stringFormatter(formatDate(new Date(), options.dateTimeFormat)) + '  '
}
