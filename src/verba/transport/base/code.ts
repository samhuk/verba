import { NormalizeVerbaStringOptions } from '../../verbaString/types'
import { renderFancyString } from "../../verbaString"

export const renderCode = (code: string | number, options?: NormalizeVerbaStringOptions) => (
  `${renderFancyString(c => c.magenta(String(code)), options)} `
)
