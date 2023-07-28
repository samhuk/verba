export const sleep = (durationSeconds: number) => new Promise<void>((res, rej) => {
  setTimeout(() => {
    res()
  }, durationSeconds * 1000)
})
