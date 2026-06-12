/**
 * Farbauswahl für Text (FA-7): feste Palette plus freie Hex-Eingabe.
 * Liefert immer normalisierte 24-Bit-Hex-Werte (`#RRGGBB`).
 */

import { useState } from 'react'
import { normalizeRgbColor } from '../fdx'
import { t } from '../i18n'

const PALETTE = [
  '#000000',
  '#6B7280',
  '#E11D48',
  '#EA580C',
  '#CA8A04',
  '#16A34A',
  '#0D9488',
  '#2563EB',
  '#7C3AED',
  '#DB2777',
]

interface ColorPickerProps {
  /** Aktive Textfarbe der Auswahl, falls vorhanden. */
  color: string | null
  onApply: (color: string) => void
  onReset: () => void
}

export function ColorPicker({ color, onApply, onReset }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [hexInput, setHexInput] = useState('')
  const [invalid, setInvalid] = useState(false)

  const applyHex = () => {
    const normalized = normalizeRgbColor(hexInput)
    if (!normalized) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    setHexInput('')
    setOpen(false)
    onApply(normalized)
  }

  return (
    <div className="relative">
      <button
        type="button"
        title={t.toolbar.textColor}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2 text-sm hover:bg-zinc-100"
      >
        <span
          className="inline-block h-4 w-4 rounded-sm border border-zinc-300"
          style={{ backgroundColor: color ?? '#000000' }}
        />
        <span className="text-xs text-zinc-600">A</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-9 z-20 w-56 rounded-lg border border-zinc-200 bg-white p-3 shadow-xl">
            <p className="mb-2 text-xs font-medium text-zinc-500">{t.color.palette}</p>
            <div className="mb-3 grid grid-cols-5 gap-1.5">
              {PALETTE.map((paletteColor) => (
                <button
                  key={paletteColor}
                  type="button"
                  title={paletteColor}
                  onClick={() => {
                    setOpen(false)
                    onApply(paletteColor)
                  }}
                  className={`h-7 w-7 rounded-md border ${
                    color === paletteColor ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-zinc-200'
                  }`}
                  style={{ backgroundColor: paletteColor }}
                />
              ))}
            </div>
            <p className="mb-1 text-xs font-medium text-zinc-500">{t.color.custom}</p>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={hexInput}
                onChange={(event) => setHexInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && applyHex()}
                placeholder="#E11D48"
                className="h-8 w-full rounded-md border border-zinc-300 px-2 font-mono text-sm"
              />
              <button
                type="button"
                onClick={applyHex}
                className="h-8 shrink-0 rounded-md bg-zinc-800 px-2 text-xs text-white hover:bg-zinc-700"
              >
                {t.color.apply}
              </button>
            </div>
            {invalid && <p className="mt-1 text-xs text-red-600">{t.color.invalid}</p>}
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onReset()
              }}
              className="mt-2 text-xs text-zinc-500 underline hover:text-zinc-800"
            >
              {t.color.reset}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
