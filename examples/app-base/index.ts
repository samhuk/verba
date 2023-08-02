import { GFError, createGFError, isGFError } from 'good-flow'

import { connectToDb } from './db'
import { doJobs } from './jobs'
import { healthcheckAPI } from './api'
import log from './log'
import { tearDownEnv } from './teardown'
import { validateEnv } from './env'
import { sleep } from './util'

const createMockMetrics = (jobs: string[]) => jobs.map(jobName => ({
  'Job Name': jobName,
  'Time Taken (s)': (Math.random() * 5).toFixed(1),
  'People Encountered': Math.round(Math.random() * 5),
}))

const uploadJobsReport = async () => {
  log.step('Uploading jobs report')
  const progressBar = log.progressBar()

  setTimeout(() => log.warn('Report overwrites \'report.txt\''), 1000)
  for (let i = 0; i < 100; i += 20) {
    await sleep(0.5)
    progressBar.update(i)
  }
  progressBar.clear()
  log.success('Jobs report uploaded')
}

export const app = async (jobs: string[]) => {
  try {
    log.header('Example App')
    log.step({ msg: 'Starting app.', code: 'INIT' })
    log.info(f => `Cache health: ${f.green('OK')}`)

    validateEnv()

    await connectToDb()
    await healthcheckAPI()
    await doJobs(jobs)
    await uploadJobsReport()
    await tearDownEnv()

    log.spacer()
    log.table(createMockMetrics(jobs))
    log.spacer()
    log.success(c => c.green(c.bold('Done!')))
  }
  catch (e) {
    log.spacer()
    const _e = e as GFError | Error
    if (isGFError(_e)) {
      _e.log()
    }
    else {
      createGFError({
        msg: 'An unexpected error occured.',
        inner: _e,
      }).log()
    }
    process.exit(1)
  }

  process.exit(0)
}

export default app
