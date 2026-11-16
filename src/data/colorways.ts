import type { Colorway } from '../store/useSceneStore'

export interface Palette {
  bg: string
  case: string
  keycap: string
  mod: string
  accent: string
}

export const PALETTES: Record<Colorway, Palette> = {
  // default: warm ivory board on a violet-black stage, acid-lime accent
  arctic: { bg: '#0c0b10', case: '#e4e1d8', keycap: '#efece4', mod: '#cfcabd', accent: '#b6ff3b' },
  obsidian: { bg: '#16181e', case: '#1d1d21', keycap: '#2a2a30', mod: '#18181c', accent: '#b6ff3b' },
  ember: { bg: '#1c0d13', case: '#e4e1d8', keycap: '#efece4', mod: '#ff4d6d', accent: '#ff4d6d' },
}
