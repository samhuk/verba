import logger from './log'
import { sleep } from './util'

const log = logger.nest({ code: 'CONNECT_DB' })

export const connectToDb = async () => {
  const spinner = log.step({
    msg: 'Connecting to DB.',
    spinner: true,
  })

  const interval = setInterval(() => {
    log.warn('Waiting for DB...')
  }, 100)

  setTimeout(() => {
    clearInterval(interval)
  }, 3500)

  await sleep(4)

  spinner.destroy()
  log.success(c => `Connected to DB at ${c.cyan(c.underline('127.0.0.1:5432'))}.`)
}
