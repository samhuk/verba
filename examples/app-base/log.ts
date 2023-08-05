import verba, { Outlet, OutletFilter, consoleTransport, fileTransport } from '../../src'

import { Code } from './codes'

type LogMessageData = { verbose: boolean }

const excludeLargeTables: OutletFilter<Code, LogMessageData> = options => (
  options.outlet !== Outlet.TABLE || options.data?.length < 10
)

const removeVerboseLogs: OutletFilter<Code, LogMessageData> = options => (
  !options.options.data?.verbose
)

const log = verba<Code, LogMessageData>({
  outletFilters: [
    excludeLargeTables,
    removeVerboseLogs,
  ],
  transports: [
    consoleTransport({
      outletPrefixes: 'textual',
      dispatchDeltaT: true,
      dispatchTimePrefix: 'MMM dd|hh:ii:ss',
    }),
    fileTransport(),
  ],
}).setAliases({
  header: logger => (s: string) => {
    logger.log(f => f.bold(f.italic(`-- ${s} --`)))
    logger.spacer()
  },
})

export default log
