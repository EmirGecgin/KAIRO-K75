import { create } from 'zustand'

export type Colorway = 'obsidian' | 'arctic' | 'ember'
export type RgbMode = 'solid' | 'wave'

interface SceneState {
  colorway: Colorway
  pressedKeys: Set<string>
  /** 0..1, driven by the Exploded section's ScrollTrigger, read every frame by the 3D layers */
  explode: number
  /** true once the preloader has opened: hero text and keyboard intro key off this */
  loaded: boolean
  /** 0 = hero pose, 1 = flat "studio" pose used from the Exploded section on */
  pose: number
  /** 0..1 camera orbit progress around the board */
  orbit: number
  /** 0..1 little "click" dip when the layers snap shut */
  thunk: number
  /** world units added to the camera's look-at height: positive pushes the board DOWN on screen (makes room for text above) */
  shiftY: number
  /** 0..1 the keyboard slides off-stage (Switches / Specs sections own the screen) */
  hide: number
  /** true once the board has fully slid off-stage: the render loop can pause */
  stageHidden: boolean
  /** 0..1 how dark the stage is (RGB section): lights fade, only the keys light the scene */
  dark: number
  /** 0..1 how much per-key RGB is on */
  rgbPower: number
  rgbMode: RgbMode
  rgbColor: string
  /** performance.now()/1000 of the last colour pick: keys switch with a delay after this → the wave */
  rgbPickT: number
  /** "Type on it" */
  typeActive: boolean
  typed: string
  soundOn: boolean

  setLoaded: (v: boolean) => void
  setColorway: (c: Colorway) => void
  pickRgb: (color: string) => void
  setRgbWave: () => void
  setSound: (on: boolean) => void
  pressKey: (code: string) => void
  releaseKey: (code: string) => void
  releaseAll: () => void
  /** apply a keystroke to the typed text */
  typeChar: (key: string) => void
}

// Shared between the 3D scene and the HTML sections.
export const useSceneStore = create<SceneState>((set) => ({
  colorway: 'arctic',
  pressedKeys: new Set(),
  explode: 0,
  loaded: false,
  pose: 0,
  orbit: 0,
  thunk: 0,
  shiftY: 0,
  hide: 0,
  stageHidden: false,
  dark: 0,
  rgbPower: 0,
  rgbMode: 'solid',
  rgbColor: '#b6ff3b',
  rgbPickT: 0,
  typeActive: false,
  typed: '',
  soundOn: false,

  setLoaded: (loaded) => set({ loaded }),
  setColorway: (colorway) => set({ colorway }),
  pickRgb: (rgbColor) => set({ rgbColor, rgbMode: 'solid', rgbPickT: performance.now() / 1000 }),
  setRgbWave: () => set({ rgbMode: 'wave' }),
  setSound: (soundOn) => set({ soundOn }),
  pressKey: (code) =>
    set((s) => (s.pressedKeys.has(code) ? s : { pressedKeys: new Set(s.pressedKeys).add(code) })),
  releaseKey: (code) =>
    set((s) => {
      if (!s.pressedKeys.has(code)) return s
      const next = new Set(s.pressedKeys)
      next.delete(code)
      return { pressedKeys: next }
    }),
  releaseAll: () => set((s) => (s.pressedKeys.size ? { pressedKeys: new Set() } : s)),
  typeChar: (key) =>
    set((s) => {
      if (key === 'Backspace') return { typed: s.typed.slice(0, -1) }
      if (key === 'Enter') return { typed: '' }
      if (key.length === 1) return { typed: (s.typed + key).slice(-40) }
      return s
    }),
}))
