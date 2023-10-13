import verba, { Outlet, OutletFilter, consoleTransport, fileTransport } from '../../src'

import { Code } from './codes'
import stringify from 'safe-stable-stringify'

type LogMessageData = { verbose: boolean }

const excludeLargeTables: OutletFilter = options => (
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
      outletPrefixes: 'textual-muted',
      deltaT: true,
      timePrefix: 'MMM dd|hh:ii:ss',
      dataRenderer: data => stringify(data, null, 2) ?? '',
    }),
    fileTransport({
      batchOptions: {
        interval: 2000,
      },
    }),
  ],
}).setAliases({
  header: logger => (s: string) => {
    logger.log(f => f.bold(f.italic(`-- ${s} --`)))
    logger.spacer()
  },
})

export default log
