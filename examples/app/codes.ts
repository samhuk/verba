/**
 * The possible codes of the application.
 *
 * These provide a short and unique code for particular parts of the application to
 * aid in logging, debugging, providing customer support, etc.
 */
export const CODES_LIST = [
  'INIT',
  'CONNECT_DB',
  'HEALTHCHECK_API',
  'JOB',
  'JOBS',
] as const

export type Code = (typeof CODES_LIST)[number]

export const CODES: Record<Code, string> = {} as Record<Code, string>
CODES_LIST.forEach(c => CODES[c] = c)
