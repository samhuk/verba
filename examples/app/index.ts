import { createGFError } from 'good-flow'

import { connectToDb } from './db'
import { doJobs } from './jobs'
import { healthcheckAPI } from './api'
import log from './log'
import { tearDownEnv } from './teardown'
import { validateEnv } from './env'

const JOBS = [
  'open_garage',
  'get_in_car',
  'start_engine',
  'drive_to_work',
  'do_work',
  'drive_home',
]

const createMockMetrics = () => JOBS.map(jobName => ({
  'Job Name': jobName,
  'Time Taken (s)': (Math.random() * 5).toFixed(1),
  'People Encountered': Math.round(Math.random() * 5),
}))

const splash = () => {
  log.log(f => f.italic(f.bold('-- Example App --')))
  log.spacer()
}

const main = async () => {
  try {
    splash()

    log.step({ msg: 'Starting app.', code: 'INIT' })

    validateEnv()

    await connectToDb()
    await healthcheckAPI()
    await doJobs(JOBS)
    await tearDownEnv()

    log.spacer()
    log.table(createMockMetrics())
    log.spacer()
    log.success(c => c.green(c.bold('Done!')))
  }
  catch (e) {
    createGFError({
      msg: 'An error occured.',
      inner: e as any,
    }).log()
    process.exit(1)
  }

  process.exit(0)
}

main()
