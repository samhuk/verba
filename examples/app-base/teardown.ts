import logger from './log'
import { sleep } from './util'

const MOCK_JSON_LOG_OBJ = {
  key: '123',
  teardownDt: 1234,
  teardownEpoch: Date.now(),
  dbConnected: false,
  env: {
    dbUrl: null,
  },
}

const log = logger.child({ code: 'TEARDOWN_ENV' })

export const tearDownEnv = async () => {
  const spinner = log.spinner('Tearing down.')

  await sleep(2)

  spinner.clear()
  log.success('Env teardown complete.')
  log.json(MOCK_JSON_LOG_OBJ, { pretty: true })
}
