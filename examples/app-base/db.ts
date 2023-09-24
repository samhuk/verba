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
  // Log some info every 0.5s
  const interval = setInterval(() => {
    log.info(MOCK_DB_INTRA_LOADING_MESSAGES[i])
    i++
  }, 500)

  // We do the loop for 1.9s to ensure that we only do max 3 logs, which is how many
  // have been prepared in the log message array, i.e. floor(1.9 / 0.5) = 3.
  // Interestingly, as of writing, having this as 2s still only results in 3 0.5s loops
  // whereas with Bun, it results in 4 0.5s loops (causing a failure).
  setTimeout(() => {
    clearInterval(interval)
  }, 1900)

  await sleep(2)

  // Test stopping spinner
  spinner.clear()
  log.success(c => `Connected to DB at ${c.cyan(c.underline('127.0.0.1:5432'))}.`)
}
