import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSceneStore } from '../../store/useSceneStore'
import { SWITCHES } from '../../data/content'
import SwitchSvg from './parts/SwitchSvg'

gsap.registerPlugin(ScrollTrigger)

/**
 * Vertical scroll → horizontal motion. The section is pinned; a scrubbed tween slides a wide flex track left.
 * Each card gets its own ScrollTrigger with `containerAnimation`: that tells GSAP "my position is measured
 * along the horizontal tween, not the page", so cards can swing in (rotateY) as they reach the viewport.
 * The 3D keyboard slides off-stage while this section is on screen (store.hide).
 */
export default function Switches() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const track = root.current!.querySelector<HTMLElement>('.sw-track')!
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const h = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current, pin: true, start: 'top top',
            end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          },
        })

        gsap.utils.toArray<HTMLElement>('.sw-card').forEach((card) => {
          gsap.fromTo(
            card,
            { rotateY: 38, opacity: 0.25, scale: 0.92 },
            {
              rotateY: 0, opacity: 1, scale: 1, ease: 'power2.out',
              scrollTrigger: { trigger: card, containerAnimation: h, start: 'left 95%', end: 'left 50%', scrub: true },
            },
          )
        })

        // keyboard leaves as we arrive, returns just before the next section
        const vh = () => window.innerHeight
        const clamp = gsap.utils.clamp(0, 1)
        ScrollTrigger.create({
          start: () => h.scrollTrigger!.start - vh(),
          end: () => h.scrollTrigger!.end,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const y = self.scroll()
            const inn = clamp((y - (h.scrollTrigger!.start - vh())) / vh())
            const out = clamp((y - (h.scrollTrigger!.end - vh() * 0.6)) / (vh() * 0.6))
            useSceneStore.setState({ hide: inn * (1 - out) })
          },
          onLeaveBack: () => useSceneStore.setState({ hide: 0 }),
          onLeave: () => useSceneStore.setState({ hide: 0 }),
        })
      })

      // reduced motion: no pin, no tilt. The track simply scrolls sideways by hand.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        track.parentElement!.style.overflowX = 'auto'
      })

      return () => useSceneStore.setState({ hide: 0 })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="switches" className="relative h-[100svh] overflow-hidden">
      <div className="h-full overflow-hidden [perspective:1400px]">
        <div className="sw-track flex h-full w-max items-center gap-6 px-6 md:gap-10 md:px-12">
          <div className="w-[82vw] shrink-0 md:w-[34vw]">
            <p className="label">04 — Switches</p>
            <h2 className="mt-4 font-display text-[clamp(2.4rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
              Three feels.<br />One board.
            </h2>
            <p className="mt-6 max-w-sm text-mute">
              Hot-swap sockets mean you are never locked in. Start with one, change your mind later, no soldering.
            </p>
            <p className="label mt-10">Keep scrolling →</p>
          </div>

          {SWITCHES.map((s, i) => (
            <article
              key={s.id}
              className="sw-card flex h-[74svh] w-[82vw] shrink-0 flex-col rounded-3xl border border-white/10 bg-[#0e0e12]/85 p-6 backdrop-blur-md [transform-style:preserve-3d] md:w-[40vw] md:p-10"
            >
              <div className="flex items-center justify-between">
                <span className="label">0{i + 1} / 03</span>
                <span className="label text-kairo">{s.force}</span>
              </div>
              <div className="my-2 min-h-0 flex-1">
                <SwitchSvg kind={s.id} />
              </div>
              <h3 className="font-display text-4xl font-bold tracking-tight md:text-6xl">{s.name}</h3>
              <p className="mt-2 text-sm text-mute md:text-base">{s.tag}</p>
              <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                {[['Actuation', s.actuation], ['Travel', s.travel], ['Sound', s.sound]].map(([k, v]) => (
                  <div key={k}>
                    <dt className="label">{k}</dt>
                    <dd className="mt-1 text-sm text-bone">{v}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
          <div className="w-[8vw] shrink-0" aria-hidden />
        </div>
      </div>
    </section>
  )
}
