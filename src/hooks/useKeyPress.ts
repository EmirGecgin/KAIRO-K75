import { useEffect } from 'react'
import { useSceneStore } from '../store/useSceneStore'
import { KEY_BY_CODE } from '../data/layout75'
import { playClick } from '../lib/clickSound'

const isEditable = (t: EventTarget | null) => {
  const el = t as HTMLElement | null
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)
}

/**
 * Mirrors the visitor's real keyboard onto the 3D one, but ONLY while the "Type on it" section is on screen
 * (store.typeActive) and never while a form field has focus. Ctrl/Cmd/Alt shortcuts are left alone.
 * Mount once, near the root.
 */
export function useKeyPress() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const s = useSceneStore.getState()
      if (!s.typeActive || isEditable(e.target) || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.code === 'Space' || e.code.startsWith('Arrow') || e.code === 'Backspace') e.preventDefault() // keep the page from scrolling/navigating
      if (!KEY_BY_CODE.has(e.code)) return
      if (!e.repeat) {
        s.pressKey(e.code)
        if (s.soundOn) playClick()
      }
      s.typeChar(e.key) // repeats still type, like a real text field
    }
    const up = (e: KeyboardEvent) => useSceneStore.getState().releaseKey(e.code)
    const blur = () => useSceneStore.getState().releaseAll() // keyup never arrives if the window loses focus
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])
}
