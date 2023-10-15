import { Outlet, OutletToNormalizedArgsObj, SimpleOutlet } from './outlet/types'

import { VerbaBaseOutlets } from './types'
import { isVerbaString } from './verbaString'

export type ArgsNormalizer<TOutlet extends Outlet> = (...options: Parameters<VerbaBaseOutlets[TOutlet]>) => OutletToNormalizedArgsObj[TOutlet]

export const simpleOutletArgsNormalizer: ArgsNormalizer<SimpleOutlet> = options => ({
  options: (
    isVerbaString(options)
      ? {
        msg: options,
        code: undefined,
        data: undefined,
      }
      : {
        msg: options.msg,
        code: options.code ?? undefined,
        data: options.data ?? undefined,
      }
  ),
})

export const tableArgsNormalizer: ArgsNormalizer<Outlet.TABLE> = (data, options) => ({
  data,
  options: {
    ...(options ?? {}),
    columnSplitter: options?.columnSplitter ?? '  ',
    code: options?.code ?? undefined,
    data: options?.data ?? undefined,
  },
})

export const jsonArgsNormalizer: ArgsNormalizer<Outlet.JSON> = (value, options) => ({
  value,
  options: {
    pretty: options?.pretty ?? false,
    code: options?.code ?? undefined,
    data: options?.data ?? undefined,
  },
})

export const dividerArgsNormalizer: ArgsNormalizer<Outlet.DIVIDER> = options => ({
  options: {
    code: options?.code ?? undefined,
    data: options?.data ?? undefined,
  },
})

export const spacerArgsNormalizer: ArgsNormalizer<Outlet.SPACER> = options => ({
  options: typeof options === 'object'
  ? {
    numLines: options?.numLines ?? 1,
    code: options?.code ?? undefined,
    data: options?.data ?? undefined,
  }
  : { numLines: 1, code: undefined, data: undefined },
})

export const spinnerArgsNormalizer: ArgsNormalizer<Outlet.SPINNER> = options => ({
  options: !Array.isArray(options) && typeof options === 'object'
  ? {
    color: options.color ?? 'cyan',
    spinner: options.spinner ?? 'dots',
    text: options.text ?? '',
    disableAutoStart: options.disableAutoStart ?? false,
    persistInitialTextAsStepLogUponOtherLog: options.persistInitialTextAsStepLogUponOtherLog ?? true,
    code: options?.code ?? undefined,
    data: options?.data ?? undefined,
  }
  : {
    color: 'cyan',
    spinner: 'dots',
    text: options ?? '',
    disableAutoStart: false,
    persistInitialTextAsStepLogUponOtherLog: true,
    code: undefined,
    data: undefined,
  },
})

export const progressBarArgsNormalizer: ArgsNormalizer<Outlet.PROGRESS_BAR> = options => ({
  options: {
    total: options?.total ?? 100,
    format: options?.format ?? 'default',
    code: options?.code ?? undefined,
    data: options?.data ?? undefined,
  },
})
