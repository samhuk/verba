import logger from './log'
import { sleep } from './util'

const MOCK_JSON_LOG_OBJ = {
  teardownDt: 1234,
  teardownEpoch: Date.now(),
  dbConnected: false,
  env: {
    dbUrl: null,
  },
}

const log = logger.nest({ code: 'TEARDOWN_ENV' })

export const tearDownEnv = async () => {
  const spinner = log.step({
    msg: 'Tearing down.',
    spinner: true,
  })

  await sleep(2)

  spinner.destroy()
  log.success('Env teardown complete.')
  log.json(MOCK_JSON_LOG_OBJ, { pretty: true })
}
