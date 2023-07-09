/**
 * This file defines the public API of the package. Everything here will be available from
 * the top-level package name when importing as an npm package.
 *
 * E.g. `import { createPackageName, PackageNameOptions } from 'npm-package-name`
 */

import { createVerbaLogger } from './verba'

export default createVerbaLogger

export * from './types'
