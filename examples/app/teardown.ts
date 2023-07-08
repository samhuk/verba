import logger from './log'
import { sleep } from './util'

const log = logger.nest({ code: 'TEARDOWN_ENV' })

export const tearDownEnv = async () => {
  const spinner = log.step({
    msg: 'Tearing down.',
    spinner: true,
  })

  await sleep(2)

  spinner.stop()
  log.success('Env teardown complete.')
}
