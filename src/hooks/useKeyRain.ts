import { useEffect, useRef, type RefObject } from 'react'
import { useSceneStore } from '../store/useSceneStore'
import { PALETTES } from '../data/colorways'

interface P { x: number; y: number; vy: number; rot: number; vr: number; s: number; ch: string; base: string; top: string; txt: string }
const LETTERS = 'KAIRO75'.split('') // the brand's glyphs

/**
 * Keycaps falling like rain on a 2D canvas (cheap, and independent of the 3D scene).
 * Returns { setActive, burst }: `setActive(true)` while the button is hovered, `burst(n)` for the click.
 * The rAF loop only runs while particles exist or spawning is on, then it stops by itself.
 */
export function useKeyRain(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const api = useRef({ setActive: (_: boolean) => {}, burst: (_: number) => {} })

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let w = 0, h = 0, dpr = 1, raf = 0, last = 0, acc = 0, active = false
    const parts: P[] = []

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = r.width; h = r.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const spawn = (y0 = -80) => {
      const pal = PALETTES[useSceneStore.getState().colorway]
      const accent = Math.random() < 0.18
      const s = 38 + Math.random() * 38
      parts.push({
        x: Math.random() * w, y: y0 - Math.random() * 120, s,
        vy: 380 + s * 6 + Math.random() * 260, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 3,
        ch: LETTERS[Math.floor(Math.random() * LETTERS.length)],
        base: accent ? pal.accent : pal.mod, top: accent ? pal.accent : pal.keycap, txt: '#0c0b10',
      })
    }

    const draw = (p: P) => {
      ctx.save()
      ctx.translate(p.x, p.y); ctx.rotate(p.rot)
      const s = p.s, r = s * 0.2
      ctx.globalAlpha = 0.92
      ctx.fillStyle = p.base; ctx.beginPath(); ctx.roundRect(-s / 2, -s / 2, s, s, r); ctx.fill() // keycap body
      ctx.fillStyle = p.top; ctx.beginPath(); ctx.roundRect(-s * 0.38, -s * 0.44, s * 0.76, s * 0.7, r * 0.7); ctx.fill() // top face
      ctx.fillStyle = p.txt; ctx.font = `700 ${s * 0.34}px "Space Grotesk Variable", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(p.ch, 0, -s * 0.08)
      ctx.restore()
    }

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      if (active) { acc += dt * 12; while (acc >= 1) { spawn(); acc -= 1 } } // ~12 caps / second
      ctx.clearRect(0, 0, w, h)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.vy += 900 * dt // gravity
        p.y += p.vy * dt; p.rot += p.vr * dt
        if (p.y > h + 100) parts.splice(i, 1)
        else draw(p)
      }
      raf = parts.length || active ? requestAnimationFrame(frame) : 0
    }
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame) } }

    api.current.setActive = (v) => { active = v; if (v) kick() }
    api.current.burst = (n) => { for (let i = 0; i < n; i++) spawn(-40 - Math.random() * 400); kick() }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); api.current.setActive = () => {}; api.current.burst = () => {} }
  }, [canvasRef])

  return api
}
