/**
 * This file defines the public API of the package. Everything here will be available from
 * the top-level package name when importing as an npm package.
 *
 * E.g. `import { createPackageName, PackageNameOptions } from 'npm-package-name`
 */
// -- Imports (for exporting later)
import { verba } from './verba'

// -- Exports
// Transports
export { consoleTransport } from './verba/transport/console'
export { fileTransport } from './verba/transport/file'
export { baseTransport } from './verba/transport/base'
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
// Built-in Aliases
export * from './verba/alias'
// Default
export default verba
// Types
export * from './types'
