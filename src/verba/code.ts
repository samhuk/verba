import { renderFancyString } from "./string"

export const createCodeStr = (code: string | number | undefined) => (code != null
  ? `${renderFancyString(c => c.magenta(String(code)))} `
  : '')