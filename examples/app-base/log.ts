import verba, { Outlet, OutletFilter, consoleTransport } from '../../src'

import { Code } from './codes'

type LogMessageData = { verbose: boolean }

const excludeLargeTables: OutletFilter<Code, LogMessageData> = options => (
  options.outlet !== Outlet.TABLE || options.data?.length < 10
)

const removeVerboseLogs: OutletFilter<string, LogMessageData> = options => (
  !options.options.data?.verbose
)

const log = verba<Code, LogMessageData>({
  outletFilters: [
    excludeLargeTables,
    removeVerboseLogs,
  ],
  transports: [
    consoleTransport<Code, LogMessageData>(),
  ],
})

export default log
