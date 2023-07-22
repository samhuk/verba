/**
 * This file defines the public API of the package. Everything here will be available from
 * the top-level package name when importing as an npm package.
 *
 * E.g. `import { createPackageName, PackageNameOptions } from 'npm-package-name`
 */
// -- Imports
import { createVerbaLogger } from './verba'

// -- Exports
// Plugins
export { consolePlugin } from './verba/plugin/console/index'
// VerbaString
export { isVerbaString, normalizeVerbaString, renderFancyString, renderFancyStringWithFormats } from './verba/verbaString/index'
// Default
export default createVerbaLogger
// Types
export * from './types'
