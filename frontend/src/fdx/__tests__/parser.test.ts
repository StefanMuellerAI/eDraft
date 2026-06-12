import { describe, expect, it } from 'vitest'
import { FdxParseError, parseFdx } from '../parser'
import { elementText } from '../model'
import sampleFdx from './fixtures/sample.fdx?raw'

describe('parseFdx', () => {
  it('liest alle Paragraphen aus der Beispieldatei', () => {
    const screenplay = parseFdx(sampleFdx)
    expect(screenplay.elements).toHaveLength(10)
    expect(screenplay.elements.map((e) => e.type)).toEqual([
      'Scene Heading',
      'Action',
      'Character',
      'Parenthetical',
      'Dialogue',
      'Transition',
      'Shot',
      'General',
      'General', // unbekannter Typ "Cast List" → als General behandelt
      'Action',
    ])
  })

  it('übernimmt die Wurzel-Attribute', () => {
    const screenplay = parseFdx(sampleFdx)
    expect(screenplay.rootAttributes).toMatchObject({
      DocumentType: 'Script',
      Template: 'No',
      Version: '5',
    })
  })

  it('liest Stile und Farben von Text-Runs (FA-6/FA-7)', () => {
    const action = parseFdx(sampleFdx).elements[1]
    expect(action.runs).toHaveLength(5)
    expect(action.runs[1]).toMatchObject({ text: 'das Licht', bold: true })
    expect(action.runs[3]).toMatchObject({
      text: 'hart',
      bold: true,
      italic: true,
      color: '#E11D48',
    })
  })

  it('liest Underline und Background (FA-8)', () => {
    const dialogue = parseFdx(sampleFdx).elements[4]
    expect(dialogue.runs[0]).toMatchObject({
      underline: true,
      background: '#FFFF00',
    })
  })

  it('liest mehrzeilige ScriptNotes als Notiz (FA-14)', () => {
    const action = parseFdx(sampleFdx).elements[1]
    expect(action.note).toBe('Lichtstimmung mit Kamera klären\nReferenz: Vermeer')
  })

  it('liest den Visualisierungs-Link der Szene (FA-15/FA-17)', () => {
    const sceneHeading = parseFdx(sampleFdx).elements[0]
    expect(sceneHeading.visualizationUrl).toBe('https://example.org/viz/szene-01.png')
    expect(elementText(sceneHeading)).toBe('INT. ATELIER – TAG')
  })

  it('behält unbekannte Paragraph-Typen für den Export (FA-12)', () => {
    const castList = parseFdx(sampleFdx).elements[8]
    expect(castList.type).toBe('General')
    expect(castList.originalType).toBe('Cast List')
  })

  it('konserviert unbekannte Attribute und Kind-Elemente (FA-12)', () => {
    const screenplay = parseFdx(sampleFdx)
    const lastAction = screenplay.elements[9]
    expect(lastAction.passthroughAttributes).toMatchObject({
      Alignment: 'Left',
      FirstIndent: '0.00',
    })
    expect(lastAction.passthroughChildren?.[0]).toContain('Unknown_Extension')

    const general = screenplay.elements[7]
    expect(general.runs[0].passthroughAttributes).toMatchObject({
      Font: 'Courier Final Draft',
      Size: '12',
    })
  })

  it('konserviert Top-Level-Elemente neben Content (FA-12)', () => {
    const screenplay = parseFdx(sampleFdx)
    expect(screenplay.passthroughDocumentChildren).toHaveLength(2)
    expect(screenplay.passthroughDocumentChildren[0]).toContain('TitlePage')
    expect(screenplay.passthroughDocumentChildren[1]).toContain('SmartType')
  })

  it('wirft FdxParseError bei kaputtem XML', () => {
    expect(() => parseFdx('<FinalDraft><Content>')).toThrow(FdxParseError)
  })

  it('wirft FdxParseError bei fremdem Wurzelelement', () => {
    expect(() => parseFdx('<html><body/></html>')).toThrow(FdxParseError)
  })
})
