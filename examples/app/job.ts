import { renderFancyString } from '../../src/verba/string'
import logger from './log'
import { sleep } from './util'

const log = logger.nest({ code: 'JOB' })

export const doJob = async (jobName: string) => {
  const baseLogText = renderFancyString(c => `Doing job ${c.cyan(jobName)}`)

  const spinner = log.step({
    msg: `${baseLogText} | 0%`,
    spinner: true,
  })

  for (let i = 0; i < 100; i += 5) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(0.05)
    spinner.text(c => `${baseLogText} | ${c.bold(i.toString())}%`)
  }

  spinner.stop()

  log.success(c => `Completed job ${c.cyan(jobName)}`)
}
