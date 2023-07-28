/**
 * The possible codes of the application.
 *
 * These provide a short and unique code for particular parts of the application to
 * aid in logging, debugging, providing customer support, etc.
 */
export type Code = 'INIT'
  | 'ENV_VALIDATE'
  | 'CONNECT_DB'
  | 'HEALTHCHECK_API'
  | 'JOB'
  | 'JOBS'
  | 'TEARDOWN_ENV'
