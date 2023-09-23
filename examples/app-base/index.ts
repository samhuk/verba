import { GFError, createGFError, isGFError } from 'good-flow'

import { connectToDb } from './db'
import { doJobs } from './jobs'
import { healthcheckAPI } from './api'
import log from './log'
import { sleep } from './util'
import { tearDownEnv } from './teardown'
import { validateEnv } from './env'

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
    // Test aliases
    log.header('Example App')
    // Test providing code inline
    log.step({ msg: 'Starting app.', code: 'INIT' })
    // Test providing data, and colors
    log.info({
      msg: f => `Cache health: ${f.green('OK')}`,
      data: { verbose: false },
    })
    // Test verbose mode
    log.info({
      msg: f => `Cache health: ${f.green('OK')}`,
      data: { verbose: true },
    })

    validateEnv()

    await connectToDb()
    await healthcheckAPI()
    await doJobs(jobs)
    await uploadJobsReport()
    await tearDownEnv()

    log.spacer()
    log.table(createMockMetrics(jobs))
    log.spacer()
    log.error('Test error message. Nothing bad actually happened.')
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
    await log.close()
    process.exit(1)
  }

  await log.close()
  process.exit(0)
}

export default app
