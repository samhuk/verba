/**
 * This file defines the public API of the package. Everything here will be available from
 * the top-level package name when importing as an npm package.
 *
 * E.g. `import { createPackageName, PackageNameOptions } from 'npm-package-name`
 */
// -- Imports (for exporting later)
import { verba } from './verba'

// -- Exports
// Util
export { isSimpleOutlet } from './verba'
// Transports
export { consoleTransport } from './verba/transport/console'
export { fileTransport } from './verba/transport/file'
// VerbaString
export {
  isVerbaString,
  normalizeVerbaString,
  renderFancyString,
  renderStringWithFormats,
  verbaColorizer,
  verbaDecolorizer,
} from './verba/verbaString/index'
export { Outlet } from './verba/outlet/types'
// Default
export default verba
// Types
export * from './types'
