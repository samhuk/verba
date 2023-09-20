/**
 * Add to `setAliases` in order to exclude outlets that rely on a TTY terminal for nominal behavior,
 * e.g. spinners, progress bars, etc.
 */
export const EXCLUDE_TTY_OUTLETS = {
  spinner: false,
  progressBar: false,
} as const

/**
 * Add to `setAliases` in order to exclude outlets that are "presentational" and/or "structural",
 * e.g. json, table, divider, spacer, etc.
 */
export const EXCLUDE_PRESENTATIONAL_OUTLETS = {
  json: false,
  table: false,
  divider: false,
  spacer: false,
} as const

/**
 * Add to `setAliases` in order to only include the simple outlets, e.g. info, step, success, warn, error, etc. 
 */
export const ONLY_SIMPLE_OUTLETS = {
  ...EXCLUDE_TTY_OUTLETS,
  ...EXCLUDE_PRESENTATIONAL_OUTLETS,
} as const
