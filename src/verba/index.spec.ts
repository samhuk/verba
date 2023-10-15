import verba, { NestState, Outlet, OutletFilter, Verba } from '..'
import { OutletToTransportHandlerFn, VerbaTransportEventHandlers } from './transport/types'
import { Colors } from './verbaString/types'

type Env = {
  log: Verba,
  recievedNestStates: NestState[]
  recievedOutletArgs: { outlet: Outlet, args: Parameters<OutletToTransportHandlerFn[Outlet]> }[]
  recievedOnBeforeLogArgs: Parameters<VerbaTransportEventHandlers['onBeforeLog']>[]
  recievedOnAfterLogArgs: Parameters<VerbaTransportEventHandlers['onAfterLog']>[]
  recievedOutletFilterArgs: Parameters<OutletFilter>[]
  numOnCloseCalls: number
}

const arrangeTestEnv = (): Env => {
  let _this: Env = {
    log: undefined as any,
    recievedNestStates: [],
    recievedOutletArgs: [],
    recievedOnBeforeLogArgs: [],
    recievedOnAfterLogArgs: [],
    recievedOutletFilterArgs: [],
    numOnCloseCalls: 0,
  }
  _this.log = verba({
    outletFilters: [
      (...args) => {
        _this.recievedOutletFilterArgs.push(args)
        return true
      },
    ],
    transports: [
      (options, listeners, registerOnClose) => {
        listeners.add('onBeforeLog', (...args) => _this.recievedOnBeforeLogArgs.push(args))
        listeners.add('onAfterLog', (...args) => _this.recievedOnAfterLogArgs.push(args))
        registerOnClose(() => {
          _this.numOnCloseCalls++
        })

        return nestState => {
          _this.recievedNestStates.push(nestState)

          return {
            log: (...args) => {
              _this.recievedOutletArgs.push({ outlet: Outlet.LOG, args })
            },
            info: (...args) => {
              _this.recievedOutletArgs.push({ outlet: Outlet.INFO, args })
            },
            step: (...args) => {
              _this.recievedOutletArgs.push({ outlet: Outlet.STEP, args })
            },
            success: (...args) => {
              _this.recievedOutletArgs.push({ outlet: Outlet.SUCCESS, args })
            },
            warn: (...args) => {
              _this.recievedOutletArgs.push({ outlet: Outlet.WARN, args })
            },
            error: (...args) => {
              _this.recievedOutletArgs.push({ outlet: Outlet.ERROR, args })
            },
            json: (...args) => {
              _this.recievedOutletArgs.push({ outlet: Outlet.JSON, args })
            },
            table: (...args) => {
              _this.recievedOutletArgs.push({ outlet: Outlet.TABLE, args })
            },
            divider: (...args) => {
              _this.recievedOutletArgs.push({ outlet: Outlet.DIVIDER, args })
            },
            spacer: (...args) => {
              _this.recievedOutletArgs.push({ outlet: Outlet.SPACER, args })
            },
            progressBar: (...args) => {
              _this.recievedOutletArgs.push({ outlet: Outlet.PROGRESS_BAR, args })
              return undefined as any
            },
            spinner: (...args) => {
              _this.recievedOutletArgs.push({ outlet: Outlet.SPINNER, args })
              return undefined as any
            },
          }
        }
      },
    ],
  })
  return _this
}

describe('verba', () => {
  test('basic', () => {
    // -- Arrange
    const fn = (f: Colors) => `${f.red('foo')}`
    const env = arrangeTestEnv()

    // -- Act
    env.log.log('foo')
    env.log.log(fn)
    env.log.info('foo')
    env.log.info({ msg: 'foo', code: 'CODE', data: 'bar' })
    
    const childLog = env.log.child({ code: 'CHILD_CODE' })

    childLog.log('foo')
    childLog.log(fn)
    childLog.info('foo')
    childLog.info({ msg: 'foo', code: 'CHILD_CHILD_CODE', data: 'bar' })

    env.log.close()

    // -- Assert
    expect(env.numOnCloseCalls).toBe(1)
    expect(env.recievedNestStates).toEqual([
      { code: undefined, indent: 0, indentationString: '' },
      { code: 'CHILD_CODE', indent: 0, indentationString: '' },
    ])
    expect(env.recievedOutletArgs).toEqual([
      {
        args: [{
          code: undefined,
          data: undefined,
          msg: 'foo',
        }],
        outlet: 'log',
      },
      {
        args: [{
          code: undefined,
          data: undefined,
          msg: fn,
        }],
        outlet: 'log',
      },
      {
        args: [{
          code: undefined,
          data: undefined,
          msg: 'foo',
        }],
        outlet: 'info',
      },
      {
        args: [{
          code: 'CODE',
          data: 'bar',
          msg: 'foo',
        }],
        outlet: 'info',
      },
      {
        args: [{
          code: undefined,
          data: undefined,
          msg: 'foo',
        }],
        outlet: 'log',
      }, 
      {
        args: [{
          code: undefined,
          data: undefined,
          msg: fn,
        }],
        outlet: 'log',
      },
      {
        args: [{
          code: undefined,
          data: undefined,
          msg: 'foo',
        }],
        outlet: 'info',
      },
      {
        args: [{
          code: 'CHILD_CHILD_CODE',
          data: 'bar',
          msg: 'foo',
        }],
        outlet: 'info',
      },
    ])
    expect(env.recievedOutletFilterArgs).toEqual([
      [{
        options: {
          code: undefined,
          data: undefined,
          msg: 'foo',
        },
        outlet: 'log',
      }],
      [{
        options: {
          code: undefined,
          data: undefined,
          msg: fn,
        },
        outlet: 'log',
      }],
      [{
        options: {
          code: undefined,
          data: undefined,
          msg: 'foo',
        },
        outlet: 'info',
      }],
      [{
        options: {
          code: 'CODE',
          data: 'bar',
          msg: 'foo',
        },
        outlet: 'info',
      }],
      [{
        options: {
          code: undefined,
          data: undefined,
          msg: 'foo',
        },
        outlet: 'log',
      }],
      [{
        options: {
          code: undefined,
          data: undefined,
          msg: fn,
        },
        outlet: 'log',
      }],
      [{
        options: {
          code: undefined,
          data: undefined,
          msg: 'foo',
        },
        outlet: 'info',
      }],
      [{
        options: {
          code: 'CHILD_CHILD_CODE',
          data: 'bar',
          msg: 'foo',
        },
        outlet: 'info',
      }],
    ])
    expect(env.recievedOnBeforeLogArgs.length).toBe(8)
    expect(env.recievedOnAfterLogArgs.length).toBe(8)
  })
})
