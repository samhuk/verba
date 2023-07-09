import { healthcheckAPI } from '../app/api'
import { connectToDb } from '../app/db'
import { doJobs } from '../app/jobs'
import log from '../app/log'
import { tearDownEnv } from '../app/teardown'

const JOBS = [
  'open_garage',
  'get_in_car',
  'start_engine',
  'drive_to_work!',
  'do_work',
  'drive_home',
]

const main = async () => {
  log.log('-- Example App --')
  log.spacer()

  log.step({
    msg: 'Starting app.',
    code: 'INIT',
  })

  log.warn({
    msg: 'DB_URL environment variable is not defined. Using default.',
    code: 'ENV_VALIDATE',
  })

  await connectToDb()

  await healthcheckAPI()

  await doJobs(JOBS)

  await tearDownEnv()

  const mockMetrics = JOBS.map(jobName => ({
    'Job Name': jobName,
    'Time Taken (s)': (Math.random() * 5).toFixed(1),
    'People Encountered': Math.round(Math.random() * 5),
  }))

  log.spacer()

  log.table(mockMetrics)

  log.spacer()

  log.success(c => c.green(c.bold('Done!')))
}

main()
