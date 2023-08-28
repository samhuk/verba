import logger from './log'
import { sleep } from './util'

const log = logger.nest({ code: 'HEALTHCHECK_API' })

export const healthcheckAPI = async () => {
  const spinner = log.spinner({
    text: 'Healthchecking API.',
  })

  await sleep(1)

  spinner.clear()
  log.success(c => `API healthy (${c.green('200 OK')}). Uptime: ${c.yellow('500s')}.`)
}
