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

```
npm i -S verba
```

```typescript
import verba, { VerbaTransport } from 'verba'

const log = verba()

// -- Basic usage
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

// -- Advanced usage
// Message formatting & log codes
log.info({
  msg: f => `${f.green('Hello')}, ${f.blue('world!')}`,
  code: 'HELLO_WORLD_MSG',
})
// Providing default log codes & indentation
const childTaskLog = log.nest({ code: 'CHILD_TASK', indent: 2 })
childTaskLog.info('...')
childTaskLog.step('...')
// Custom transports
const transport: VerbaTransport = (loggerOptions, listeners) => {
  ...
  return nestState => {
    ...
    return {
      log: msg => ...,
      info: options => ...,
      step: options => ...,
      success: options => ...,
      warn: options => ...,
      table: (data, options) => ...,
      json: (data, options) => ...,
      divider: () => ...,
      spacer: numLines => ...,
    }
  }
}
```

## Transports

The way Verba logs are outputted can be defined by **Transports**. By default, Verba uses `consoleTransport` from [./src/verba/transport/console/index.ts](src/verba/transport/console/index.ts). This outputs log messages to the Node.js `console`.

Custom transports can be a way to define different ways to output log message.

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
      divider: () => ...,
      spacer: numLines => ...,
    }
  }
}

const log = verba({ plugins: [transport] })
```

## Examples

An example app that fully demonstrates the usage of Verba is at [./examples/app](./examples/app).

To see how to run the examples locally, see [./contributing/development.md#examples](./contributing/development.md#examples).

## Development

See [./contributing/development.md](./contributing/development.md)

---

If you found this package delightful, feel free to [sponsor me on GitHub](https://github.com/sponsors/samhuk) or [buy me a coffee](https://www.buymeacoffee.com/samhuk) ✨
