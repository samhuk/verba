import { VerbaString } from '../../src'
import logger from './log'
import { sleep } from './util'

const MOCK_DB_INTRA_LOADING_MESSAGES: VerbaString[] = [
  f => `DB version: ${f.cyan('42.0.0')}.`,
  f => `DB client healthy?: ${f.green('YES')}`,
  f => `DB network latency: ${f.yellow('45ms')}`,
]

// Test logger child-ification
const log = logger.child({ code: 'CONNECT_DB' })

export const connectToDb = async () => {
  // Test starting spinner (string-type options)
  const spinner = log.spinner('Connecting to DB.')

  // Test logging whilst a spinner is active (TTY outlet interruption)
  let i = 0
  const interval = setInterval(() => {
    log.info(MOCK_DB_INTRA_LOADING_MESSAGES[i])
    i++
  }, 500)

  setTimeout(() => {
    clearInterval(interval)
  }, 2000)

  await sleep(2)

  // Test stopping spinner
  spinner.clear()
  log.success(c => `Connected to DB at ${c.cyan(c.underline('127.0.0.1:5432'))}.`)
}
