import log from './log'

export const validateEnv = () => {
  log.warn({
    msg: 'DB_URL environment variable is not defined. Using default.',
    code: 'ENV_VALIDATE',
  })
}
