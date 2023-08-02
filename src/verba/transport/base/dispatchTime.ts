export const formatDate = (date: Date, format: string): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  const formatMap: { [key: string]: string } = {
    yyyy: String(year),
    mm: month,
    dd: day,
    hh: hour,
    ii: minute,
    ss: second,
  }

  return format.replace(/(yyyy|mm|dd|hh|ii|ss)/g, (match: string) => formatMap[match])
}
