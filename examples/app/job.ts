import { createGFError } from 'good-flow'

import logger from './log'
import { renderFancyString } from '../../src/verba/string'
import { sleep } from './util'

const log = logger.nest({ code: 'JOB' })

export const doJob = async (jobName: string) => {
  const baseLogText = renderFancyString(c => `Doing job ${c.cyan(jobName)}`)

  const spinner = log.step({
    msg: `${baseLogText} | 0%`,
    spinner: true,
  })

  if (jobName.indexOf('!') !== -1) {
    spinner.stopAndPersist()
    throw createGFError({
      msg: f => `Job name invalid. Recieved: ${f.cyan(jobName)}.`,
      advice: {
        tips: {
          msg: 'Job names must only contain alphanumeric and \'_\' characters.',
        },
      },
    })
  }

  for (let i = 0; i < 100; i += 20) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(0.1)
    spinner.text(c => `${baseLogText} | ${c.bold(i.toString())}%`)
  }

  spinner.stop()

  log.success(c => `Completed job ${c.cyan(jobName)}`)
}
