const PREMADE_INDENTS: { [n: number]: string } = {
  0: '',
  1: ' ',
  2: '  ',
  3: '   ',
  4: '    ',
  5: '     ',
  6: '      ',
  7: '       ',
  8: '        ',
}

const _createIndentationString = (n: number): string => {
  let s = ''
  for (let i = 0; i < n; i += 1)
    s += ' '
  return s
}

export const createIndentationString = (n: number): string => PREMADE_INDENTS[n] ?? _createIndentationString(n)
