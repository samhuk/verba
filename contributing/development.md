# Development

This document describes the process for setting up and running this package on your local computer.

## Prerequisites

This package is for Node.js. You can install Node.js [here](https://nodejs.org/en/).

This package runs on MacOS, Linux, and Windows environments, and runs on Node.js versions tested back to version 14.

### Setup

1. Clone the repository
    ```
    git clone https://github.com/samhuk/verba.git && cd verba
    ```
2. Install NPM dependencies:
    ```bash
    npm i
    ```

## Linting

ESLint is used for Typescript linting. To lint the Typescript code, run `npm run lint`. To only lint for errors (excluding warnings), run `npm run lint:errors`.

## Building

To build all of the Typescript code, run `npm run build`.

To only build the Typescript code that is published to npm, run `npm run build:dist`.

## Testing

### Unit Tests

Jest is used for unit testing. To build and run the unit tests, run `npm run test:unit`.

The unit tests can be debugged with Visual Studio Code by running the **Unit test current file** debug task.

## Examples

An example app that fully demonstrates the usage of Verba is at [./examples/app](./examples/app).

To run the example:
1. Clone repository:
    ```bash
    git clone https://github.com/samhuk/verba.git && cd verba
    ```
2. Install NPM dependencies:
    ```bash
    npm i
    ```
3. Run:
    ```bash
    npm run example
    ```
4. Alternatively, run the example app that errors to demonstrate error emission and handling:
    ```bash
    npm run example:error
    ```

## Miscellaneous Scripts

`npm run check` - Useful to run before committing in order to check the full validity of a change. This runs linting, Typescript build, and unit tests.

## Pull Requests

Pull requests automatically run a CI pipeline that checks various criteria:

* Linting
* Typescript build
* Unit tests

These must pass for a pull request to be approved and merged.

## NPM Publishing

Typical flow for publishing a new version:
1. Ensure that `package.json` has a bumped `version`.
1. Run `npm run check-and-dist` in order to check the validity of the code and then build the Typescript that is published to NPM.
2. Run `npm publish` to publish to npm.

## Bun

This package is, as of writing, compatible with [Bun](https://bun.sh/). The following table shows how Bun can be used for this repository.

| Task                       | Node.js command | Bun equivalent        | Uses Bun engine? [0] |
|----------------------------|-----------------|-----------------------|----------------------|
| Install deps               | npm install     | bun install           | ✅                   |
| Lint                       | npm run lint    | bun lint              | ❌                   | 
| Test                       | npm run test    | bun run test          | ❌                   |
| Build                      | npm run build   | bun run build         | ❌                   |
| Run example app            | npm run example | bun run example       | ❌                   |
| Test (with Bun)            | N/A             | bun test              | ✅                   |
| Run example app (with Bun) | N/A             | bun ./examples/app.ts | ✅                   |

[0] The *Uses Bun engine?* column refers to whether the command ends up just using NPM and Node, or if it runs completely with Bun (and therefore will have greatly improved performance). For example, `bun test` is ~8x faster than `npm run test` and `bun run test`.
