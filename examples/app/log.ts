import verba, { consolePlugin } from '../../src'

import { Code } from './codes'

const log = verba<Code>({
    plugins: [
        consolePlugin,
    ],
})

export default log
