import log from './log'
import { sleep } from './util'
import { doJobs } from './jobs'
import { connectToDb } from './db'
import { healthcheckAPI } from './api'
import { tearDownEnv } from './teardown'

const JOBS = [
  'open_garage',
  'get_in_car',
  'start_engine',
  'drive_to_work',
  'do_work',
  'drive_home',
]

const splash = () => {
  log.log('-- Example App --')
  log.spacer()
}

const main = async () => {
  splash()

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

  log.spacer()

  log.success(c => c.green(c.bold('Done!')))
}

main()
