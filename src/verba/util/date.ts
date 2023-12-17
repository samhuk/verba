const MONTHS: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * A string that describes the format to use when turning a `Date` instance into a string.
 * 
 * Available tokens:
 *
 * * `yyyy` - 4-digit year, e.g. 1970, 2023
 * * `mm` - 2-digit month of year, e.g. 01, 12
 * * `dd` - 2-digit day of month, e.g. 01, 31
 * * `HH` - 2-digit hour of day (24h format), e.g. 00, 23
 * * `hh` - 2-digit hour of day (12h format), e.g. 00, 11
 * * `ii` - 2-digit minute of hour, e.g. 00, 59
 * * `ss` - 2-digit second of minute, e.g. 00, 59
 * * `MMM` - 3-letter-abbreviated month of year, e.g. "Jan", "Dec"
 * * `a` - Meridiem, e.g. "AM", "PM"
 * * `tz` - Timezone offset, e.g. "+01:00", "-07:00"
 * 
 * @example
 * 'yyyy-mm-dd|hh-ii-ss'
 * 'MMM dd|hh:ii:ss'
 */
export type DateTimeFormat = string

export type DateTimeFormatOptions = {
  /**
   * A string that describes the format to use when turning a `Date` instance into a string.
   * 
   * Available tokens:
   *
   * * `yyyy` - 4-digit year, e.g. 1970, 2023
   * * `mm` - 2-digit month of year, e.g. 01, 12
   * * `dd` - 2-digit day of month, e.g. 01, 31
   * * `HH` - 2-digit hour of day (24h format), e.g. 00, 23
   * * `hh` - 2-digit hour of day (12h format), e.g. 00, 11
   * * `ii` - 2-digit minute of hour, e.g. 00, 59
   * * `ss` - 2-digit second of minute, e.g. 00, 59
   * * `MMM` - 3-letter-abbreviated month of year, e.g. "Jan", "Dec"
   * * `a` - Meridiem, e.g. "AM", "PM"
   * * `tz` - Timezone offset, e.g. "+01:00", "-07:00"
   * 
   * @example
   * 'yyyy-mm-dd|hh-ii-ss'
   * 'MMM dd|hh:ii:ss'
   */
  dateTimeFormat: DateTimeFormat
}

const pad = (num: number): string => (num < 10 ? '0' : '') + `${num}`

const toTimezoneOffsetString = (date: Date) => {
  const tzo = -date.getTimezoneOffset()
  const dif = tzo >= 0 ? '+' : '-'
  const tzoAbs = Math.abs(tzo)
  return `${dif}${pad(Math.floor(tzoAbs / 60))}:${pad(tzoAbs % 60)}`
}

/**
 * Available tokens:
 *
 * * `yyyy` - 4-digit year, e.g. 1970, 2023
 * * `mm` - 2-digit month of year, e.g. 01, 12
 * * `dd` - 2-digit day of month, e.g. 01, 31
 * * `HH` - 2-digit hour of day (24h format), e.g. 00, 23
 * * `hh` - 2-digit hour of day (12h format), e.g. 00, 11
 * * `ii` - 2-digit minute of hour, e.g. 00, 59
 * * `ss` - 2-digit second of minute, e.g. 00, 59
 * * `MMM` - 3-letter-abbreviated month of year, e.g. "Jan", "Dec"
 * * `a` - Meridiem, e.g. "AM", "PM"
 * * `tz` - Timezone offset, e.g. "+01:00", "-07:00"
 * 
 * @example
 * 'yyyy-mm-ddThh:ii:ss' // E.g. 1970-01-01T23:59:59 (I.e. ISO 8601)
 * 'MMM dd hh:ii:ss' // E.g. Jan 01 23:59:59
 */
export const formatDate = (date: Date, format: DateTimeFormat): string => {
  const hours = date.getHours()
  const monthIndex = date.getMonth()
  const formatMap: { [key: string]: string } = {
    yyyy: date.getFullYear().toString(), // Year (4 digit)
    mm: pad(monthIndex + 1), // Month of year (1-12)
    dd: pad(date.getDate()), // Day of month (1-31)
    HH: pad(hours), // Hour of day (24h format)
    hh: pad((hours % 12) || 12), // Hour of day (12h format)
    ii: pad(date.getMinutes()), // Minute of hour
    ss: pad(date.getSeconds()), // Second on minute
    a: hours >= 0 && hours < 12 ? 'AM' : 'PM', // Meridiem
    MMM: MONTHS[monthIndex], // "Jan" to "Dec"
    tz: toTimezoneOffsetString(date), // Timezone offset
  }

  return format.replace(/(yyyy|mm|dd|HH|hh|ii|ss|a|MMM|tz)/g, match => formatMap[match])
}
