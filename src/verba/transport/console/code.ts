import { renderFancyString } from "../../verbaString"
import { NormalizeVerbaStringOptions } from '../../verbaString/types'

export const createCodeStr = (code: string | number | undefined, options?: NormalizeVerbaStringOptions) => (code != null
  ? `${renderFancyString(c => c.magenta(String(code)), options)} `
  : '')
