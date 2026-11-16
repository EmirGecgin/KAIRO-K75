/**
 * 75% layout as data. Each row is a list of [KeyboardEvent.code, label, width in u, kind].
 * Positions are computed once below, so the 3D model, the "type on it" input
 * and the RGB wave all share the same source of truth.
 */
export type KeyKind = 'alpha' | 'mod' | 'accent'
type Def = readonly [code: string, label: string, w: number, kind?: KeyKind]
export interface KeyData {
  code: string
  label: string
  w: number
  kind: KeyKind
  row: number
  /** key centre, in units (1u = one key pitch), origin = keyboard centre */
  cx: number
  cz: number
  /** 0..1 position left→right, used for the RGB wave delay */
  t: number
}

const A: KeyKind = 'alpha'
const M: KeyKind = 'mod'
const X: KeyKind = 'accent'

const ROWS: Def[][] = [
  [['Escape', 'Esc', 1, X], ...Array.from({ length: 12 }, (_, i): Def => [`F${i + 1}`, `F${i + 1}`, 1, M]),
    ['Delete', 'Del', 1, M], ['Home', 'Hm', 1, M], ['PageUp', 'Pu', 1, M]],
  [['Backquote', '`', 1, A], ...'1234567890'.split('').map((c): Def => [`Digit${c}`, c, 1, A]),
    ['Minus', '-', 1, A], ['Equal', '=', 1, A], ['Backspace', 'Bksp', 2, M], ['PageDown', 'Pd', 1, M]],
  [['Tab', 'Tab', 1.5, M], ...'QWERTYUIOP'.split('').map((c): Def => [`Key${c}`, c, 1, A]),
    ['BracketLeft', '[', 1, A], ['BracketRight', ']', 1, A], ['Backslash', '\\', 1.5, M], ['End', 'End', 1, M]],
  [['CapsLock', 'Caps', 1.75, M], ...'ASDFGHJKL'.split('').map((c): Def => [`Key${c}`, c, 1, A]),
    ['Semicolon', ';', 1, A], ['Quote', "'", 1, A], ['Enter', 'Enter', 2.25, X], ['Insert', 'Ins', 1, M]],
  [['ShiftLeft', 'Shift', 2.25, M], ...'ZXCVBNM'.split('').map((c): Def => [`Key${c}`, c, 1, A]),
    ['Comma', ',', 1, A], ['Period', '.', 1, A], ['Slash', '/', 1, A], ['ShiftRight', 'Shift', 1.75, M],
    ['ArrowUp', '↑', 1, M], ['PrintScreen', 'Prt', 1, M]],
  [['ControlLeft', 'Ctrl', 1.25, M], ['MetaLeft', 'Win', 1.25, M], ['AltLeft', 'Alt', 1.25, M],
    ['Space', '', 6.25, X], ['AltRight', 'Alt', 1, M], ['Fn', 'Fn', 1, M]],
]
// bottom row's arrows sit at fixed columns (13..15) under the Up arrow
const ARROWS: [string, string, number][] = [['ArrowLeft', '←', 13], ['ArrowDown', '↓', 14], ['ArrowRight', '→', 15]]

const ROW_Z = [0, 1.5, 2.5, 3.5, 4.5, 5.5] // function row has a half-unit gap
export const KB_WIDTH = 16
export const KB_DEPTH = 6 // key-centre span + 1
const CX0 = KB_WIDTH / 2
const CZ0 = (ROW_Z[0] + ROW_Z[5]) / 2

export const KEYS: KeyData[] = (() => {
  const out: KeyData[] = []
  ROWS.forEach((row, r) => {
    let x = 0
    for (const [code, label, w, kind = A] of row) {
      out.push({ code, label, w, kind, row: r, cx: x + w / 2 - CX0, cz: ROW_Z[r] - CZ0, t: 0 })
      x += w
    }
  })
  for (const [code, label, col] of ARROWS) {
    out.push({ code, label, w: 1, kind: M, row: 5, cx: col + 0.5 - CX0, cz: ROW_Z[5] - CZ0, t: 0 })
  }
  for (const k of out) k.t = (k.cx + CX0) / KB_WIDTH
  return out
})()

export const KEY_BY_CODE = new Map(KEYS.map((k) => [k.code, k]))
/** outer bounds of the key field, used to size plate / PCB / case */
export const FIELD = { w: KB_WIDTH, d: ROW_Z[5] - ROW_Z[0] + 1 }
