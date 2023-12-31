<h1 align="center">Verba</h1>
<p align="center">
  <em>Node logging library</em>
</p>

<p align="center">
  <a href="https://github.com/samhuk/verba/actions/workflows/build.yml/badge.svg" target="_blank">
    <img src="https://github.com/samhuk/verba/actions/workflows/build.yml/badge.svg" alt="build status" />
  </a>
  <a href="https://img.shields.io/badge/License-MIT-green.svg" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="license" />
  </a>
  <a href="https://badge.fury.io/js/verba.svg" target="_blank">
    <img src="https://badge.fury.io/js/verba.svg" alt="npm version" />
  </a>
</p>

<div align="center">
  <img src="./img/demo.gif" />
</div>

## Overview

Node logging library.

## Usage Overview

### Install

```
npm i -S verba
```

### Basic Usage

```typescript
import verba from 'verba'

const log = verba()

log.info('...')
log.step('...')
log.warn('...')
log.success('...')
log.json({ foo: 'bar' })
log.table([
  { foo: 1, bar: 2 },
  { foo: 3, bar: 4 },
])
log.spacer()
log.divider()
const spinner = log.spinner('...')
spinner.text('...')
const bar = log.progressBar({ /* ... */ })
bar.update(20) // 20%
```

### Advanced Usage

Defining allowed log codes and log message data:

```typescript
type LogCode = 'INIT' | 'ENV_VALIDATE' | 'CONNECT_DB' | ...
type LogData = { verbose: boolean, ... }
const log = verba<LogCode, LogData>()
```

Message formatting, log codes, and log data:

```typescript
log.info({
  msg: f => `${f.green('Hello')}, ${f.blue('world!')}`,
  code: 'HELLO_WORLD_MSG',
  data: { verbose: true }
})
```

Providing default log codes and indentation:

```typescript
const childTaskLog = log.child({ code: 'CHILD_TASK', indent: 2 })
childTaskLog.info('...')
childTaskLog.step('...')
```

Loading spinners (only for TTY consoles):

```typescript
const spinner = log.spinner('Doing job')
// Update spinner text when progress updates occur
spinner.text('Doing job | 100%')
// Either clear the spinner and text line...
spinner.clear()
// ...Or stop the spinning and leave in console
spinner.persist()
log.success('Finished job')
```

Disabling colors for a Transport:

```typescript
import verba, { consoleTransport } from 'verba'
const colorlessTransport = consoleTransport({
  disableColors: true
})
const log = verba({
  Transports: [colorlessTransport]
})
```

Using both console and file built-in Transports:

```typescript
import verba, { consoleTransport, fileTransport } from 'verba'
const log = verba({
  Transports: [consoleTransport(), fileTransport()]
})
```

For more usage information, see the next sections.

## Transports

Where and how Verba logs are outputted can be defined by **Transports**.

Verba has two built-in Transports: `consoleTransport` and `fileTransport` (defined at [./src/verba/transport](./src/verba/transport)). By default, `consoleTransport` is used.

Custom Transports can be a way to define completely different ways to output log messages. For example:

```typescript
import verba, { VerbaTransport } from 'verba'

const transport: VerbaTransport = (
  // The original options received from the top-level `verba` instance.
  loggerOptions,
  // A listener store providing the ability to listen to various events of the verba instance.
  listeners
) => {
  /* ...Setup (ran once)... */
  // Called every time a verba logger instance is nested.
  return nestState => {
    /* ...Setup (ran for every nested logger)... */
    // Return an object that instructs how the Transport outputs log messages.
    return {
      log: msg => { /* ... */ },
      info: options => { /* ... */ },
      step: options => { /* ... */ },
      success: options => { /* ... */ },
      /* ...Rest of outlets... */
    }
  }
}

const log = verba({ transports: [transport] })
```

## Aliases

**Aliases** can be used to:

1. Add new custom outlets.
2. Modify built-in outlets (i.e. `log`, `info`, `step`, etc.).
3. Exclude built-in outlets.

This can be useful when you need to:
1. Integrate Verba into a legacy codebase by allowing you to modify the arguments of built-in outlets.
2. Add new custom outlets that do conveninent/custom log output that would otherwise need multiple log calls (i.e. boxes, banners, etc.).
3. Exclude built-in outlets that you don't want for your application.

**Note:** Aliases that define *new* outlets will not interact with any defined Transports or Outlet Filters of the logger instance.

### Example 1 - Adding a new `header` outlet

```typescript
import verba from 'verba'

const log = verba().setAliases({
  header: logger => (s: string) => {
    logger.log(f => f.bold(f.italic(`-- ${s} --`)))
    logger.spacer()
  },
})
```

### Example 2 - Modifying the built-in `warn` outlet

```typescript
import verba from 'verba'

type MyLegacyCodebaseLogOptions = {
  message: string
  severity: 'urgent' | 'critical' /* | ... */
}

const log = verba().setAliases({
  // Provide a shim for the built-in `warn` outlet
  warn: logger => (options: MyLegacyCodebaseLogOptions) => {
    logger.warn({
      msg: options.message,
      data: { severity: options.severity },
    })
  },
})
```

### Example 3 - Excluding the built-in `info` outlet

```typescript
import verba from 'verba'

const log = verba().setAliases({
  warn: false
})
```

## Outlet Filters

Verba log messages can be included and excluded via **Outlet Filters**.

Outlet Filters filter messages *before* Transports.

One can filter based on any aspect of any log message, for example the `Outlet` of the log message (e.g. `log`, `step`, `info`, `table`, `json`, etc.), the options supplied to them, the data supplied to `table`, and so on.

### Example 1 - Exclude tables over 5 rows

```typescript
import verba, { OutletFilter } from 'verba'

const excludeLargeTables: OutletFilter = options => (
  options.outlet !== Outlet.TABLE || options.data?.length < 6
)
const log = verba({
  outletFilters: [excludeLargeTables]
})
log.table([1, 2, 3, 4, 5]) // Included
log.table([1, 2, 3, 4, 5, 6]) // Excluded
```

### Example 2 - Exclude verbose logs

```typescript
import verba, { OutletFilter } from 'verba'

type LogMessageData = { verbose: boolean }
const excludeVerbose: OutletFilter<string, LogMessageData> = options => (
  !options.options.data.verbose
)
const log = verba<string, LogMessageData>({
  outletFilters: [excludeVerbose]
})
log.info({
  msg: 'This is verbose and therefore excluded',
  data: { verbose: true }
})
```

## Examples

An example app that fully demonstrates the usage of Verba is at [./examples/app-base](./examples/app-base).

To see how to run the examples locally, see [./contributing/development.md#examples](./contributing/development.md#examples).

## Development

Install NPM dependencies:
```
npm i
```

| Task            | Command         |
|-----------------|-----------------|
| Lint            | npm run lint    |
| Test            | npm run test    |
| Build           | npm run build   |
| Run example app | npm run example |

See [./contributing/development.md](./contributing/development.md) for more information.

---

If you found this package delightful, feel free to [sponsor me on GitHub](https://github.com/sponsors/samhuk) or [buy me a coffee](https://www.buymeacoffee.com/samhuk) ✨
