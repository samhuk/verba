import { doJob } from './job'
import log from './log'

export const doJobs = async (
  jobNames: string[],
) => {
  log.step({
    msg: c => `Doing ${c.yellow(jobNames.length.toString())} jobs.`,
    header: true,
    code: 'JOBS',
  })

  for (let i = 0; i < jobNames.length; i += 1)
    // eslint-disable-next-line no-await-in-loop
    await doJob(jobNames[i])
}
