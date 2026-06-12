/**
 * Serialisierungs-Strategie für den Visualisierungs-Link pro Szene (§6.6).
 *
 * Umgesetzt ist Option A: ein eigenes, klar benanntes Kind-Element im
 * Scene-Heading-`<Paragraph>`:
 *
 *   <Paragraph Type="Scene Heading">
 *     <Text>INT. ATELIER – TAG</Text>
 *     <FA_Visualization url="https://…/szene-01.png"/>
 *   </Paragraph>
 *
 * Diese Datei ist die EINZIGE Stelle, die das Format kennt. Ein späterer
 * Wechsel auf Option B (strukturierte ScriptNote mit `VIZ::`-Marker) ändert
 * nur diese beiden Funktionen — Parser und Serializer bleiben unberührt.
 */

export const VIZ_ELEMENT_NAME = 'FA_Visualization'
const URL_ATTRIBUTE = 'url'

/** Liest die URL aus einem Viz-Kind-Element; `undefined` wenn nicht lesbar. */
export function readVisualizationUrl(element: Element): string | undefined {
  if (element.tagName !== VIZ_ELEMENT_NAME) return undefined
  // Tolerant gegenüber Groß-/Kleinschreibung des Attributs (FA-12).
  return element.getAttribute(URL_ATTRIBUTE) ?? element.getAttribute('URL') ?? undefined
}

/** Erzeugt das Viz-Kind-Element für den Export. */
export function createVisualizationElement(doc: Document, url: string): Element {
  const element = doc.createElementNS(null, VIZ_ELEMENT_NAME)
  element.setAttribute(URL_ATTRIBUTE, url)
  return element
}
