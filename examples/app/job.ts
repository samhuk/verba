import logger from './log'
import { sleep } from './util'

const log = logger.nest({ code: 'JOB' })

export const doJob = async (jobName: string) => {
  log.step(c => `Doing job '${c.cyan(jobName)}'.`)
  await sleep(1)
}
