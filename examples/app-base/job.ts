import { FancyString } from '../../src/verba/verbaString/types'
import { createGFError } from 'good-flow'
import logger from './log'
import { sleep } from './util'

const log = logger.nest({ code: 'JOB', indent: 2 })

export const doJob = async (jobName: string) => {
  const baseLogText: FancyString = c => `Doing job ${c.cyan(jobName)}`

  const spinner = log.step({
    msg: baseLogText,
    spinner: true,
  })

  if (jobName.indexOf('!') !== -1) {
    spinner.stopAndPersist()
    throw createGFError({
      msg: f => `Job name invalid. Recieved: ${f.cyan(jobName)}.`,
      advice: { tips: 'Job names must only contain alphanumeric and \'_\' characters.' },
    })
  }

  for (let i = 0; i < 100; i += 20) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(0.1)
    // Every other update is logged if terminal is not TTY.
    spinner.text([baseLogText, c => ` | ${c.bold(i.toString())}%`], i % 40 === 0)
  }

  spinner.destroy()
  log.success(c => `Completed job ${c.cyan(jobName)}`)
}
