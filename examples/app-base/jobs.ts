import { createGFError } from 'good-flow'
import { doJob } from './job'
import logger from './log'

const log = logger.child({ code: 'JOBS' })

export const doJobs = async (
  jobNames: string[],
) => {
  try {
    const jobNamesLogStr = jobNames.length.toString()
    log.step(c => `Doing ${c.yellow(jobNamesLogStr)} jobs.`)

    const start = Date.now()
    for (let i = 0; i < jobNames.length; i += 1)
      // eslint-disable-next-line no-await-in-loop
      await doJob(jobNames[i])

    const dtS = ((Date.now() - start) / 1000).toFixed(1)

    log.success(c => `Completed ${c.yellow(jobNamesLogStr)} jobs in ${c.yellow(dtS.toString())}s.`)
  }
  catch (e) {
    throw createGFError({
      msg: 'Could not execute jobs',
      data: {
        code: 'JOBS',
      },
      inner: e as any,
    })
  }
}
