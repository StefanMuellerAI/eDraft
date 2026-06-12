import { describe, expect, it } from 'vitest'
import { parseFdx } from '../parser'
import { serializeFdx } from '../serializer'
import { createEmptyScreenplay, type Screenplay } from '../model'
import sampleFdx from './fixtures/sample.fdx?raw'

describe('Round-Trip FDX → Modell → FDX (NFA-4)', () => {
  it('bleibt semantisch identisch (Fixture)', () => {
    const first = parseFdx(sampleFdx)
    const second = parseFdx(serializeFdx(first))
    expect(second).toEqual(first)
  })

  it('ist nach dem ersten Export stabil (Fixpunkt)', () => {
    const first = serializeFdx(parseFdx(sampleFdx))
    const second = serializeFdx(parseFdx(first))
    expect(second).toBe(first)
  })

  it('erhält Notizen und Visualisierungs-Links (Akzeptanzkriterium 5)', () => {
    const roundTripped = parseFdx(serializeFdx(parseFdx(sampleFdx)))
    expect(roundTripped.elements[0].visualizationUrl).toBe(
      'https://example.org/viz/szene-01.png',
    )
    expect(roundTripped.elements[1].note).toBe(
      'Lichtstimmung mit Kamera klären\nReferenz: Vermeer',
    )
  })

  it('erhält Farben als 48-Bit-Hex (Akzeptanzkriterium 4)', () => {
    const xml = serializeFdx(parseFdx(sampleFdx))
    expect(xml).toContain('Color="#E1E11D1D4848"')
    const roundTripped = parseFdx(xml)
    expect(roundTripped.elements[1].runs[3].color).toBe('#E11D48')
  })

  it('serialisiert ein synthetisches Drehbuch vollständig (Modell → FDX → Modell)', () => {
    const screenplay: Screenplay = {
      rootAttributes: { DocumentType: 'Script', Template: 'No', Version: '5' },
      passthroughDocumentChildren: [],
      elements: [
        {
          type: 'Scene Heading',
          runs: [{ text: 'EXT. WALD – NACHT' }],
          visualizationUrl: 'https://example.org/wald.png',
          note: 'Nebelmaschine?',
        },
        {
          type: 'Action',
          runs: [
            { text: 'Ein Schatten ' },
            { text: 'huscht', bold: true, italic: true, underline: true, color: '#FF0000' },
            { text: ' vorbei.' },
          ],
        },
        { type: 'Character', runs: [{ text: 'ERZÄHLER' }] },
        { type: 'Dialogue', runs: [{ text: 'Niemand sah ihn kommen.' }] },
      ],
    }
    expect(parseFdx(serializeFdx(screenplay))).toEqual(screenplay)
  })

  it('exportiert ein neues, leeres Drehbuch als valide FDX (FA-10/FA-11)', () => {
    const xml = serializeFdx(createEmptyScreenplay())
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')
    expect(xml).toContain('DocumentType="Script"')
    const parsed = parseFdx(xml)
    expect(parsed.elements).toHaveLength(1)
    expect(parsed.elements[0].type).toBe('Scene Heading')
  })

  it('kombinierte Stile werden mit "+" geschrieben (§6.4)', () => {
    const screenplay = createEmptyScreenplay()
    screenplay.elements[0].runs = [{ text: 'X', bold: true, italic: true }]
    expect(serializeFdx(screenplay)).toContain('Style="Bold+Italic"')
  })
})
