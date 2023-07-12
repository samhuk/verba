import { NestOptions } from "./types"
import { renderFancyString } from "./string"

/**
 * Navigates backwards through the given nest options list and returns
 * the first code that it comes across.
 */
export const getParentCode = (
  nestOptionsList: NestOptions[],
): string | number | undefined => {
  for (let i = nestOptionsList.length; i >= 0; i -= 1) {
    if (nestOptionsList[i]?.code != null)
      return nestOptionsList[i].code
  }

  return undefined
}

export const createCodeStr = (code: string | number | undefined) => (code != null
  ? `${renderFancyString(c => c.magenta(String(code)))} `
  : '')
