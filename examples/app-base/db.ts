import { VerbaString } from '../../src'
import logger from './log'
import { sleep } from './util'

const MOCK_DB_INTRA_LOADING_MESSAGES: VerbaString[] = [
  f => `DB version: ${f.cyan('42.0.0')}.`,
  f => `DB client healthy?: ${f.green('YES')}`,
  f => `DB network latency: ${f.yellow('45ms')}`,
]

const log = logger.nest({ code: 'CONNECT_DB' })

export const connectToDb = async () => {
  const spinner = log.step({
    msg: 'Connecting to DB.',
    spinner: true,
  })

  // This tests logging whilst a spinner is active.
  let i = 0
  const interval = setInterval(() => {
    log.info(MOCK_DB_INTRA_LOADING_MESSAGES[i])
    i++
  }, 500)

  setTimeout(() => {
    clearInterval(interval)
  }, 2000)

  await sleep(2)

  spinner.destroy()
  log.success(c => `Connected to DB at ${c.cyan(c.underline('127.0.0.1:5432'))}.`)
}
