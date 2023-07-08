import log from './log'
import { sleep } from './util'

const main = async () => {
  log.step({
    msg: 'Starting app.',
    code: 'INIT',
  })

  const spinner = log.step({
    msg: 'Connecting to DB.',
    code: 'CONNECT_DB',
    spinner: true,
  })

  await sleep(2)

  spinner.stop()
  log.success('Connected to DB.')

  await doJobs([
    'open_garage',
    '',
  ])
}

main()
