import { InstantiatedVerbaTransport, VerbaTransportEventHandlers, VerbaTransportEventName } from '../types'

import { baseTransport } from '.'
import { createListenerStore } from '../../util/listenerStore'
import { createObservable } from '../../util/reactive'

const sleep = (durationSeconds: number) => new Promise<void>(res => {
  setTimeout(() => {
    res()
  }, durationSeconds * 1000)
})


type Env = {
  instantiatedTransport: InstantiatedVerbaTransport
  dispatches: string[]
  numOnCloseCalls: number
}

const createEnv = (): Env => {
  const listeners = createListenerStore<VerbaTransportEventName, VerbaTransportEventHandlers>()
  const closeObservable = createObservable()
  let _this: Env = {
    instantiatedTransport: undefined as any,
    dispatches: [],
    numOnCloseCalls: 0,
  }
  const transport = baseTransport({
    codeRenderer: true,
    deltaT: false,
    timePrefix: false,
    disableColors: true,
    dispatch: s => _this.dispatches.push(s),
    onClose: () => {
      _this.numOnCloseCalls++
    },
    dispatchDeltaT: false,
    dispatchTimePrefix: false,
    isTty: false,
    outletPrefixes: undefined,
    dataRenderer: true,
  })
  _this.instantiatedTransport = transport({ }, listeners, closeObservable.subscribe)
  return _this
}

describe('verba/transport/base', () => {
  test('basic', async () => {
    // -- Arrange
    const env = createEnv()
    // -- Act
    const transport = env.instantiatedTransport({ code: undefined, indent: 0, indentationString: '' })
    transport.log({ msg: 'foo', code: undefined, data: 'bar' })
    transport.info({ msg: 'foo', code: 'CODE', data: 'bar' })
    const spinner = transport.spinner({ 
      code: undefined,
      color: 'cyan',
      data: undefined,
      disableAutoStart: false,
      spinner: 'aesthetic',
      text: 'loading',
      persistInitialTextAsStepLogUponOtherLog: true,
    })

    await sleep(0.1)
    spinner?.text('loading (25%)', false)
    await sleep(0.1)
    spinner?.text('loading (50%)', true)
    await sleep(0.1)
    spinner?.text('loading (75%)', false)
    await sleep(0.1)
    spinner?.clear()
    transport.success({ msg: 'done', code: 'CODE', data: 'bar' })
    const transport2 = env.instantiatedTransport({ code: 'CHILD_CODE', indent: 2, indentationString: '  ' })
    transport2.info({ msg: 'foo', code: undefined, data: 'bar' })
    transport2.info({ msg: 'foo', code: 'CHILD_CHILD_CODE', data: undefined })
    // -- Assert
    expect(env.dispatches).toEqual([
      'foo',
      'i CODE foo\nbar',
      '* loading',
      '* loading (25%)',
      '* loading (75%)',
      '✔ CODE done\nbar',
      '  i CHILD_CODE foo\nbar',
      '  i CHILD_CHILD_CODE foo',
    ])
  })
})
