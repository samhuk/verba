export const onUnexpectedExit = (fn: () => Promise<void> | void): void => {
  process.once('beforeExit', fn)
}
