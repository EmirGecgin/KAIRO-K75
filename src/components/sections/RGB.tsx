import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import * as m from 'motion/react-m'
import { useSceneStore } from '../../store/useSceneStore'

gsap.registerPlugin(ScrollTrigger)

const SWATCHES = [
  { name: 'Lime', c: '#b6ff3b' },
  { name: 'Cyan', c: '#28e0ff' },
  { name: 'Violet', c: '#8b5cff' },
  { name: 'Magenta', c: '#ff3dae' },
  { name: 'Amber', c: '#ffb020' },
  { name: 'Red', c: '#ff3b3b' },
] as const

/**
 * "Light it up": scrolling in darkens the stage (store.dark) and switches the per-key RGB on (store.rgbPower).
 * Colour picks go straight to the store; the 3D keys do the sweeping delay themselves (see Keycaps).
 * Same sticky trick as TypeOnIt: 200svh section, 100svh sticky content.
 */
export default function RGB() {
  const root = useRef<HTMLElement>(null)
  const color = useSceneStore((s) => s.rgbColor)
  const mode = useSceneStore((s) => s.rgbMode)
  const pickRgb = useSceneStore((s) => s.pickRgb)
  const setRgbWave = useSceneStore((s) => s.setRgbWave)

  useGSAP(
    () => {
      const p = { dark: 0, shiftY: 0 }
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.8,
          onEnter: () => useSceneStore.getState().pickRgb(useSceneStore.getState().rgbColor), // replay the sweep on arrival
          onEnterBack: () => useSceneStore.getState().pickRgb(useSceneStore.getState().rgbColor),
        },
        onUpdate: () => useSceneStore.setState({ dark: p.dark, rgbPower: p.dark, shiftY: p.shiftY }),
      })
        .to(p, { dark: 1, shiftY: 0.8, duration: 1, ease: 'power2.inOut' }) // lights go out as the section arrives
        .to(p, { dark: 1, duration: 1 })
        .to(p, { dark: 0, shiftY: 0, duration: 1, ease: 'power2.inOut' })

      gsap.from('.rgb-in', {
        opacity: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: 'top 50%', once: true },
      })
      return () => useSceneStore.setState({ dark: 0, rgbPower: 0, shiftY: 0 })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="rgb" className="pointer-events-none relative h-[200svh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between px-6 pb-10 pt-24 md:px-12">
        <div className="rgb-in">
          <p className="label">05 — Light it up</p>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
            Per-key RGB.<br />16.8 million shades.
          </h2>
        </div>

        <div className="rgb-in pointer-events-auto flex flex-col items-center gap-5">
          <p className="label">{mode === 'wave' ? 'Wave mode' : 'Pick a colour'}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {SWATCHES.map((s) => {
              const active = mode === 'solid' && color === s.c
              return (
                <m.button
                  key={s.c}
                  type="button"
                  aria-label={s.name}
                  aria-pressed={active}
                  onClick={() => pickRgb(s.c)}
                  whileHover={{ scale: 1.18 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="relative h-10 w-10 rounded-full md:h-12 md:w-12"
                  style={{ backgroundColor: s.c, boxShadow: active ? `0 0 0 2px #0c0b10, 0 0 0 4px ${s.c}` : undefined }}
                />
              )
            })}
            <m.button
              type="button"
              aria-pressed={mode === 'wave'}
              onClick={setRgbWave}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className={`label rounded-full border px-5 py-3 transition-colors ${mode === 'wave' ? 'border-bone text-bone' : 'border-white/20 hover:text-bone'}`}
            >
              Wave
            </m.button>
          </div>
        </div>
      </div>
    </section>
  )
}
