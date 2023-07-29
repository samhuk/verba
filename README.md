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
  <b>NOTE: WIP project.</b>
</div>

<div align="center">
  <img src="./img/demo.gif" />
</div>

## Overview

End-game Javascript logging library.

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
```

### Advanced Usage

Defining allowed log codes:

```typescript
type Code = 'INIT' | 'ENV_VALIDATE' | 'CONNECT_DB' | ...
const log = verba<Code>()
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
const childTaskLog = log.nest({ code: 'CHILD_TASK', indent: 2 })
childTaskLog.info('...')
childTaskLog.step('...')
```

Loading spinners (only for TTY consoles):

```typescript
const spinner = log.step({
  msg: 'Doing job',
  spinner: true
})
// Update spinner text when progress updates occur
spinner.text('Doing job | 100%')
// Either clear the spinner and text line...
spinner.destroy()
// ...Or stop the spinning and leave in console
spinner.stopAndPersist()
log.success('Finished job')
...
```

Disabling colors for `consoleTransport`:

```typescript
import verba, { consoleTransport } from 'verba'
const transport = consoleTransport({
  disableColors: true
})
const log = verba({ transports: [transport] })
```

For more usage information, see the next sections.

## Transports

Where and how Verba logs are outputted can be defined by **Transports**.

By default, Verba uses only `consoleTransport` ([./src/verba/transport/console/index.ts](src/verba/transport/console/index.ts)). This outputs log messages to the Node.js `console`.

Custom transports can be a way to define completely different ways to output log messages. For example:

```typescript
import verba, { VerbaTransport } from 'verba'

const transport: VerbaTransport = (
  // The original options received from the top-level `verba` instance.
  loggerOptions,
  // A listener store providing the ability to listen to various events of the verba instance.
  listeners
) => {
  ...
  // Called every time a verba logger instance is nested.
  return nestState => {
    ...
    // Return an object that instructs how the transport outputs log messages.
    return {
      log: msg => ...,
      info: options => ...,
      step: options => ...,
      success: options => ...,
      warn: options => ...,
      table: (data, options) => ...,
      json: (data, options) => ...,
      divider: options => ...,
      spacer: options => ...,
    }
  }
}

const log = verba({ transports: [transport] })
```

## Outlet Filters

Verba log messages can be included and excluded via **Outlet Filters**.

One can filter based on any aspect of any log message, for example the `Outlet` of the log message (e.g. `log`, `step`, `info`, `table`, `json`, etc.), the options supplied to them, the data supplied to `table`, and so on.

### Example - Exclude tables over 5 rows

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

### Example - Exclude verbose logs

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

An example app that fully demonstrates the usage of Verba is at [./examples/app](./examples/app).

To see how to run the examples locally, see [./contributing/development.md#examples](./contributing/development.md#examples).

## Development

Install NPM dependencies:
```
npm i
```

Lint Typescript code:
```shell
npm run lint
```

Build and run unit tests:
```shell
npm run unit-tests
```

Build all Typescript code (excluding app example):
```shell
npm run build-ts
```

Build and run app example:
```shell
npm run example
```

See [./contributing/development.md](./contributing/development.md) for more information

---

If you found this package delightful, feel free to [sponsor me on GitHub](https://github.com/sponsors/samhuk) or [buy me a coffee](https://www.buymeacoffee.com/samhuk) ✨
