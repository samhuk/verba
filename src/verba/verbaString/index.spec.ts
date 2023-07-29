import { normalizeVerbaString, renderFancyString, renderStringWithFormats } from '.'

const isTty = process.stdout.isTTY

console.log('-- isTty:', process.stdout.isTTY)

describe('verba/verbaString', () => {
  describe('normalizeVerbaString', () => {
    const fn = normalizeVerbaString

    test('string', () => {
      const result = fn('foo')
      expect(result).toBe('foo')
    })

    test('function', () => {
      const result = fn(f => `${f.blue('foo')} ${f.bold('bar')}`)
      expect(result).toBe(isTty ? '[34mfoo[39m [1mbar[22m' : 'foo bar')
    })

    test('array', () => {
      const result = fn(['foo', f => ` ${f.blue('bar')} ${f.bold('fizz')} `, 'buzz'])
      expect(result).toBe(isTty ? 'foo [34mbar[39m [1mfizz[22m buzz' : 'foo bar fizz buzz')
    })

    test('empty array', () => {
      const result = fn([])
      expect(result).toBe('')
    })
  })

  describe('renderFancyString', () => {
    const fn = renderFancyString

    test('basic test', () => {
      const result = fn(f => `${f.blue('foo')} ${f.bold('bar')}`)
      expect(result).toBe(isTty ? '[34mfoo[39m [1mbar[22m' : 'foo bar')
    })

    test('fn returning empty string', () => {
      const result = fn(() => '')
      expect(result).toBe('')
    })
  })

  describe('normalizeVerbaString', () => {
    const fn = normalizeVerbaString

    test('string', () => {
      const result = fn('foo')
      expect(result).toBe('foo')
    })

    test('function', () => {
      const result = fn(f => `${f.blue('foo')} ${f.bold('bar')}`)
      expect(result).toBe(isTty ? '[34mfoo[39m [1mbar[22m' : 'foo bar')
    })

    test('array', () => {
      const result = fn(['foo', f => ` ${f.blue('bar')} ${f.bold('fizz')} `, 'buzz'])
      expect(result).toBe(isTty ? 'foo [34mbar[39m [1mfizz[22m buzz' : 'foo bar fizz buzz')
    })

    test('empty array', () => {
      const result = fn([])
      expect(result).toBe('')
    })
  })

  describe('renderStringWithFormats', () => {
    const fn = renderStringWithFormats

    test('basic test', () => {
      const result = fn('foo', ['blue', 'bold', 'underline'])
      expect(result).toBe(isTty ? '[4m[1m[34mfoo[39m[22m[24m' : 'foo')
    })

    test('empty string', () => {
      const result = fn('', ['blue', 'bold', 'underline'])
      expect(result).toBe('')
    })

    test('empty array', () => {
      const result = fn('foo', [])
      expect(result).toBe('foo')
    })

    test('empty string and empty array', () => {
      const result = fn('', [])
      expect(result).toBe('')
    })
  })
})
