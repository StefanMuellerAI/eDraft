import { describe, expect, it } from 'vitest'
import { parseFdx } from '../../fdx'
import { docJsonToElements, screenplayToDocJson } from '../conversion'
import sampleFdx from '../../fdx/__tests__/fixtures/sample.fdx?raw'

describe('Modell ↔ Editor-Dokument (Round-Trip über die Editor-Schicht)', () => {
  it('erhält alle Elemente, Stile, Notizen, Links und Durchreiche-Daten', () => {
    const screenplay = parseFdx(sampleFdx)
    const roundTripped = docJsonToElements(screenplayToDocJson(screenplay))
    expect(roundTripped).toEqual(screenplay.elements)
  })

  it('bildet leere Elemente als leeren Run ab', () => {
    const elements = docJsonToElements({
      type: 'doc',
      content: [{ type: 'action', attrs: { note: null, vizUrl: null, passthrough: null } }],
    })
    expect(elements).toEqual([{ type: 'Action', runs: [{ text: '' }] }])
  })

  it('unbekannte Node-Typen werden tolerant als General behandelt', () => {
    const elements = docJsonToElements({
      type: 'doc',
      content: [{ type: 'mystery', content: [{ type: 'text', text: 'x' }] }],
    })
    expect(elements[0].type).toBe('General')
  })
})
