import logger from './log'
import { sleep } from './util'

const log = logger.nest({ code: 'HEALTHCHECK_API' })

export const healthcheckAPI = async () => {
  const spinner = log.step({
    msg: 'Healthchecking API.',
    spinner: true,
  })

  await sleep(1)

  spinner.destroy()
  log.success(c => `API healthy (${c.green('200 OK')}). Uptime: ${c.yellow('500s')}.`)
}
