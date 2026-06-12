/**
 * Farb-Konvertierung zwischen Standard-24-Bit-Hex (`#RRGGBB`) und dem
 * FDX-48-Bit-Format (`#RRRRGGGGBBBB`, 16 Bit pro Kanal) gemäß §6.4.
 *
 * Export: jeder Kanalwert wird durch Verdopplung der zwei Hex-Stellen vom
 * Byte zum Wort erweitert, z. B. `#E11D48` → `#E1E11D1D4848`.
 * Import: je Kanal werden die oberen 8 Bit (erste zwei Hex-Stellen) als
 * 24-Bit-Anzeigewert verwendet.
 */

const RGB_24_PATTERN = /^#?([0-9a-fA-F]{6})$/
const RGB_48_PATTERN = /^#?([0-9a-fA-F]{12})$/

/** `#E11D48` → `#E1E11D1D4848`. Wirft bei ungültiger Eingabe. */
export function rgbToFdxColor(rgb: string): string {
  const match = rgb.trim().match(RGB_24_PATTERN)
  if (!match) {
    throw new Error(`Ungültige 24-Bit-Hex-Farbe: "${rgb}"`)
  }
  const hex = match[1].toUpperCase()
  let result = '#'
  for (let i = 0; i < 6; i += 2) {
    const channel = hex.slice(i, i + 2)
    result += channel + channel
  }
  return result
}

/** `#E1E11D1D4848` → `#E11D48`. Wirft bei ungültiger Eingabe. */
export function fdxColorToRgb(fdx: string): string {
  const match = fdx.trim().match(RGB_48_PATTERN)
  if (!match) {
    throw new Error(`Ungültige FDX-48-Bit-Hex-Farbe: "${fdx}"`)
  }
  const hex = match[1].toUpperCase()
  let result = '#'
  for (let i = 0; i < 12; i += 4) {
    result += hex.slice(i, i + 2)
  }
  return result
}

/** Tolerante Variante für den Import: liefert `undefined` statt zu werfen. */
export function tryFdxColorToRgb(fdx: string | null | undefined): string | undefined {
  if (!fdx) return undefined
  try {
    return fdxColorToRgb(fdx)
  } catch {
    return undefined
  }
}

/** Prüft, ob ein String eine gültige 24-Bit-Hex-Farbe ist (UI-Validierung). */
export function isValidRgbColor(value: string): boolean {
  return RGB_24_PATTERN.test(value.trim())
}

/** Normalisiert Nutzereingaben wie `e11d48` zu `#E11D48`; sonst `undefined`. */
export function normalizeRgbColor(value: string): string | undefined {
  const match = value.trim().match(RGB_24_PATTERN)
  if (!match) return undefined
  return `#${match[1].toUpperCase()}`
}
