/**
 * This file defines the public API of the package. Everything here will be available from
 * the top-level package name when importing as an npm package.
 *
 * E.g. `import { createPackageName, PackageNameOptions } from 'npm-package-name`
 */
// -- Imports
import { createVerbaLogger } from './verba'

// -- Exports
// Transports
export { consoleTransport } from './verba/transport/console/index'
// VerbaString
export {
  isVerbaString,
  normalizeVerbaString,
  renderFancyString,
  renderStringWithFormats,
  verbaColorizer,
  verbaDecolorizer,
} from './verba/verbaString/index'
// Default
export default createVerbaLogger
// Types
export * from './types'
