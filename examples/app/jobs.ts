import { doJob } from './job'
import log from './log'

export const doJobs = async (
  jobNames: string[],
) => {
  const jobNamesLogStr = jobNames.length.toString()
  log.step({
    msg: c => `Doing ${c.yellow(jobNamesLogStr)} jobs.`,
    header: true,
    code: 'JOBS',
  })

  const start = Date.now()
  for (let i = 0; i < jobNames.length; i += 1)
    // eslint-disable-next-line no-await-in-loop
    await doJob(jobNames[i])

  const dtS = ((Date.now() - start) / 1000).toFixed(1)

  log.success({
    msg: c => `Completed ${c.yellow(jobNamesLogStr)} jobs in ${c.yellow(dtS.toString())}s.`,
    code: 'JOBS',
  })
}
