import { DispatchServiceQueue } from './types'

export const createStreamMessageQueue = (stream: { write: (s: string, onComplete: (err: any) => void) => void }): DispatchServiceQueue => {
  let isDraining = false
  let queue: string[] = []
  let instance: DispatchServiceQueue

  return instance = {
    size: 0,
    add: s => instance.size = queue.push(s),
    drain: () => {
      if (isDraining)
        return Promise.resolve()

      isDraining = true
      return new Promise<void>(res => {
        let textFromQueue = queue.join('\n')
        if (textFromQueue.length > 0)
          textFromQueue = textFromQueue + '\n'
        queue = []
        instance.size = 0

        stream.write(textFromQueue, () => {
          isDraining = false
          res()
        })
      })
    },
  }
}
