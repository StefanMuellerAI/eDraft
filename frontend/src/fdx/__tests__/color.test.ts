import { describe, expect, it } from 'vitest'
import {
  fdxColorToRgb,
  isValidRgbColor,
  normalizeRgbColor,
  rgbToFdxColor,
  tryFdxColorToRgb,
} from '../color'

describe('rgbToFdxColor (24 Bit → 48 Bit, §6.4)', () => {
  it('verdoppelt jeden Kanalwert gemäß Spezifikation', () => {
    expect(rgbToFdxColor('#E11D48')).toBe('#E1E11D1D4848')
    expect(rgbToFdxColor('#FF0000')).toBe('#FFFF00000000')
    expect(rgbToFdxColor('#000000')).toBe('#000000000000')
  })

  it('akzeptiert Kleinschreibung und fehlendes #', () => {
    expect(rgbToFdxColor('e11d48')).toBe('#E1E11D1D4848')
  })

  it('wirft bei ungültiger Eingabe', () => {
    expect(() => rgbToFdxColor('#FFF')).toThrow()
    expect(() => rgbToFdxColor('rot')).toThrow()
  })
})

describe('fdxColorToRgb (48 Bit → 24 Bit)', () => {
  it('verwendet die oberen 8 Bit je Kanal', () => {
    expect(fdxColorToRgb('#E1E11D1D4848')).toBe('#E11D48')
    expect(fdxColorToRgb('#FFFF00000000')).toBe('#FF0000')
    expect(fdxColorToRgb('#000000000000')).toBe('#000000')
  })

  it('ist invers zu rgbToFdxColor (Round-Trip)', () => {
    for (const color of ['#E11D48', '#1A2B3C', '#FFFFFF', '#00FF7F']) {
      expect(fdxColorToRgb(rgbToFdxColor(color))).toBe(color)
    }
  })

  it('wirft bei ungültiger Eingabe', () => {
    expect(() => fdxColorToRgb('#E11D48')).toThrow()
  })
})

describe('tryFdxColorToRgb (tolerant für den Import, FA-12)', () => {
  it('liefert undefined statt zu werfen', () => {
    expect(tryFdxColorToRgb('kaputt')).toBeUndefined()
    expect(tryFdxColorToRgb(null)).toBeUndefined()
    expect(tryFdxColorToRgb(undefined)).toBeUndefined()
    expect(tryFdxColorToRgb('#FFFF00000000')).toBe('#FF0000')
  })
})

describe('UI-Validierung', () => {
  it('isValidRgbColor', () => {
    expect(isValidRgbColor('#E11D48')).toBe(true)
    expect(isValidRgbColor('e11d48')).toBe(true)
    expect(isValidRgbColor('#FFF')).toBe(false)
  })

  it('normalizeRgbColor', () => {
    expect(normalizeRgbColor(' e11d48 ')).toBe('#E11D48')
    expect(normalizeRgbColor('#abcdef')).toBe('#ABCDEF')
    expect(normalizeRgbColor('nope')).toBeUndefined()
  })
})
