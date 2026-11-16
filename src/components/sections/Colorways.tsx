import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import * as m from 'motion/react-m'
import { useSceneStore, type Colorway } from '../../store/useSceneStore'
import { PALETTES } from '../../data/colorways'
import { COLORWAYS } from '../../data/content'

gsap.registerPlugin(ScrollTrigger)

/**
 * Choosing a colourway only writes `store.colorway`. The 3D side (cap colours, case, background, glow) eases
 * toward the new palette by itself, and the page accent (--color-kairo) is swapped here via a CSS variable.
 */
export default function Colorways() {
  const root = useRef<HTMLElement>(null)
  const current = useSceneStore((s) => s.colorway)
  const setColorway = useSceneStore((s) => s.setColorway)

  useEffect(() => {
    document.documentElement.style.setProperty('--color-kairo', PALETTES[current].accent)
  }, [current])

  useGSAP(
    () => {
      const p = { shiftY: 0 }
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        onUpdate: () => useSceneStore.setState({ shiftY: p.shiftY }),
      })
        .to(p, { shiftY: 2.4, duration: 1, ease: 'power2.inOut' })
        .to(p, { shiftY: 2.4, duration: 1 })
        .to(p, { shiftY: 0, duration: 1, ease: 'power2.inOut' })

      gsap.from('.cw-in', {
        opacity: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: 'top 50%', once: true },
      })
      return () => useSceneStore.setState({ shiftY: 0 })
    },
    { scope: root },
  )

  const active = COLORWAYS.find((c) => c.id === current)!

  return (
    <section ref={root} id="colorways" className="pointer-events-none relative h-[200svh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between px-6 pb-10 pt-24 md:px-12">
        <div className="cw-in">
          <p className="label">07 — Colorways</p>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
            Pick your <span className="text-kairo">{active.name}</span>.
          </h2>
          <p className="mt-3 text-mute">{active.text}</p>
        </div>

        <div className="cw-in pointer-events-auto flex flex-wrap items-center justify-center gap-3 md:gap-4" role="radiogroup" aria-label="Colourway">
          {COLORWAYS.map((c) => {
            const on = c.id === current
            return (
              <m.button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setColorway(c.id as Colorway)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                className={`flex items-center gap-3 rounded-full border py-2 pl-2 pr-6 transition-colors ${on ? 'border-bone bg-white/10' : 'border-white/15 hover:border-white/40'}`}
              >
                <span className="relative block h-10 w-10 overflow-hidden rounded-full border border-white/20" style={{ background: c.case }}>
                  <span className="absolute inset-x-[22%] bottom-0 top-[40%] rounded-t-md" style={{ background: c.cap }} />
                </span>
                <span className="label text-bone">{c.name}</span>
              </m.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
