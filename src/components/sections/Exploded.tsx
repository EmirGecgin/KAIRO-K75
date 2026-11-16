import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSceneStore } from '../../store/useSceneStore'
import { layerAnchors } from '../../store/layerAnchors'
import { LAYER_COPY } from '../../data/content'

gsap.registerPlugin(ScrollTrigger)

const set = (patch: Partial<ReturnType<typeof useSceneStore.getState>>) => useSceneStore.setState(patch)

/**
 * The star section. Two ScrollTriggers drive the 3D scene through the store:
 *  1) "enter":  while the section scrolls into view, pose 0→1 (hero tilt → flat studio view).
 *  2) "pinned": the section pins for 300vh; a scrubbed timeline moves explode / orbit / thunk.
 * The scene never gets told *how* to animate, only a few numbers 0..1 that scroll owns.
 * Labels are plain HTML, positioned every frame from the projected 3D anchors (layerAnchors).
 */
export default function Exploded() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const short = window.matchMedia('(max-width: 767px)').matches
        const proxy = { pose: 0, explode: 0, orbit: 0, thunk: 0 }

        // 1) enter: hero → flat view, finished exactly when the pin starts (continuous, no jump)
        gsap.to(proxy, {
          pose: 1, ease: 'power2.inOut',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top top', scrub: 0.6 },
          onUpdate: () => set({ pose: proxy.pose }),
        })

        // 2) pinned timeline. Position units are arbitrary (0–10); scrub maps them onto the scroll distance.
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: short ? '+=200%' : '+=300%', // shorter on phones
            pin: true,
            scrub: 1, // 1s of smoothing: the 3D lags the scrollbar a little, which feels "heavy" and premium
            anticipatePin: 1,
          },
          onUpdate: () => set({ explode: proxy.explode, orbit: proxy.orbit, thunk: proxy.thunk }),
        })
        tl.to(proxy, { orbit: 1, duration: 7 }, 0) // camera swings around while the layers open…
          .to(proxy, { orbit: 0.42, duration: 2.5, ease: 'power2.inOut' }, 7) // …and settles dead-front (0.42 ≈ angle 0) for what follows
          .to(proxy, { explode: 1, duration: 4.5, ease: 'power2.inOut' }, 0.5) // layers leave top→bottom
          .to(proxy, { explode: 0, duration: 2, ease: 'expo.in' }, 7.5) // …then slam shut
          .to(proxy, { thunk: 1, duration: 0.15, ease: 'power2.out' }, 9.5) // the "click": board dips
          .to(proxy, { thunk: 0, duration: 0.35, ease: 'back.out(4)' }, 9.65)
          .fromTo('.xl-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0)
          .to('.xl-title', { opacity: 0, y: -30, duration: 1, ease: 'power2.in' }, 9)

        return () => set({ pose: 0, explode: 0, orbit: 0, thunk: 0 })
      })

      // reduced motion: no pin, no scrub. A calm static exploded view with all labels shown.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        set({ pose: 1, explode: 1, orbit: 0.5 })
        gsap.set('.xl-title', { opacity: 1 })
        return () => set({ pose: 0, explode: 0, orbit: 0 })
      })

      // labels follow their 3D anchors on every GSAP tick (transform + opacity only)
      const labels = gsap.utils.toArray<HTMLElement>('.xl-label')
      const update = () => {
        const vw = window.innerWidth
        const margin = vw < 768 ? 12 : Math.max(24, vw * 0.04)
        labels.forEach((el, i) => {
          const a = layerAnchors[i]
          const right = i % 2 === 0
          const textW = (el.querySelector('.xl-text') as HTMLElement).offsetWidth
          const edge = right ? vw - margin - textW : margin + textW
          const len = Math.max(28, right ? edge - a.x : a.x - edge)
          const show = gsap.utils.clamp(0, 1, (a.open - 0.3) / 0.4)
          el.style.opacity = String(show)
          el.style.transform = `translate3d(${a.x}px, ${a.y}px, 0)`
          const line = el.querySelector('.xl-line') as HTMLElement
          line.style.transform = `scaleX(${len * show})`
          ;(el.querySelector('.xl-text') as HTMLElement).style.transform = `translate3d(${right ? len : -len}px, -50%, 0)`
        })
      }
      gsap.ticker.add(update)
      return () => gsap.ticker.remove(update)
    },
    { scope: root },
  )

  return (
    <section ref={root} id="exploded" className="relative h-[100svh] overflow-hidden">
      <div className="xl-title absolute left-6 top-24 md:left-12">
        <p className="label">02 — Anatomy</p>
        <h2 className="mt-4 font-display text-[clamp(2.2rem,4.4vw,4.5rem)] font-bold leading-[0.95] tracking-tight">
          Six layers.<br />One feel.
        </h2>
      </div>

      {LAYER_COPY.map((l, i) => {
        const right = i % 2 === 0
        return (
          <div key={l.name} className="xl-label pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform">
            <span className="absolute -left-[3px] -top-[3px] h-[7px] w-[7px] rounded-full bg-kairo" />
            {/* the leader line is 1px wide and stretched with scaleX in JS: transform-only animation */}
            <span
              className={`xl-line absolute top-0 block h-px w-px bg-bone/50 ${right ? 'left-0 origin-left' : 'right-0 origin-right'}`}
            />
            <div
              className={`xl-text absolute top-0 w-[4.8rem] md:w-60 ${right ? 'left-0 pl-3 text-left' : 'right-0 pr-3 text-right'}`}
            >
              <p className="label text-bone">
                <span className="text-kairo">0{i + 1}</span> {l.name}
              </p>
              <p className="mt-1 hidden text-sm leading-snug text-mute md:block">{l.text}</p>
            </div>
          </div>
        )
      })}
    </section>
  )
}
