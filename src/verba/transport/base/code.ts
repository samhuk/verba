import { renderFancyString } from "../../verbaString"
import { NormalizeVerbaStringOptions } from '../../verbaString/types'

export const createCodeStr = (code: string | number, options?: NormalizeVerbaStringOptions) => (
  `${renderFancyString(c => c.magenta(String(code)), options)} `
)
