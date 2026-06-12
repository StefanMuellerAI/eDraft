/**
 * Öffentliche Schnittstelle des FDX-Moduls.
 *
 * UI- und Editor-Code importieren ausschließlich von hier; die interne
 * Aufteilung (parser/serializer/color/vizLink) bleibt austauschbar (NFA-3).
 */

export * from './model'
export * from './color'
export { parseFdx, FdxParseError } from './parser'
export { serializeFdx } from './serializer'
