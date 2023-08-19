const MONTHS: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const formatDate = (date: Date, format: string): string => {
  const hours = date.getHours()
  const monthIndex = date.getMonth()
  const formatMap: { [key: string]: string } = {
    yyyy: String(date.getFullYear()), // Year (4 digit)
    mm: String(monthIndex + 1).padStart(2, '0'), // Month of year (1-12)
    dd: String(date.getDate()).padStart(2, '0'), // Day of month (1-31)
    HH: String(hours).padStart(2, '0'), // Hour of day (24h format)
    hh: String((hours % 12) || 12).padStart(2, '0'), // Hour of day (12h format)
    ii: String(date.getMinutes()).padStart(2, '0'), // Minute of hour
    ss: String(date.getSeconds()).padStart(2, '0'), // Second on minute
    a: hours >= 0 && hours < 12 ? 'AM' : 'PM', // Meridiem
    MMM: MONTHS[monthIndex], // "Jan" to "Dec"
  }

  return format.replace(/(yyyy|mm|dd|HH|hh|ii|ss|a|MMM)/g, match => formatMap[match])
}
