import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSceneStore } from '../../store/useSceneStore'

gsap.registerPlugin(ScrollTrigger)

/**
 * The board stays in the fixed canvas; this section only owns the text layer and tells the scene two things:
 *  - typeActive: "the visitor is looking at this section" → keyboard events are mirrored onto the 3D keys
 *  - shiftY: push the board down on screen so the typed text has room above it
 * The whole section is pointer-events-none so touches/clicks fall through to the 3D keys in the canvas (mobile typing).
 * Layout trick: a 200svh section with a sticky 100svh child = the content "holds" for one extra screen of scrolling.
 */
export default function TypeOnIt() {
  const root = useRef<HTMLElement>(null)
  const typed = useSceneStore((s) => s.typed)
  const soundOn = useSceneStore((s) => s.soundOn)
  const setSound = useSceneStore((s) => s.setSound)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const proxy = { shiftY: 0 }

      // one scrubbed timeline over the whole pass: 1/3 enter (shift in), 1/3 hold, 1/3 leave (shift back)
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: reduced ? true : 0.8 },
        onUpdate: () => useSceneStore.setState({ shiftY: proxy.shiftY }),
      })
        .to(proxy, { shiftY: 3.4, duration: 1, ease: 'power2.inOut' })
        .to(proxy, { shiftY: 3.4, duration: 1 })
        .to(proxy, { shiftY: 0, duration: 1, ease: 'power2.inOut' })

      // keyboard input is live only while this section is the thing on screen
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 55%',
        end: 'bottom 45%',
        onToggle: (self) => {
          useSceneStore.setState({ typeActive: self.isActive })
          if (!self.isActive) useSceneStore.getState().releaseAll()
        },
      })

      gsap.from('.ty-in', {
        opacity: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 60%', once: true },
      })

      return () => useSceneStore.setState({ shiftY: 0, typeActive: false })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="type" className="pointer-events-none relative h-[200svh]">
      <div className="sticky top-0 flex h-[100svh] flex-col px-6 pb-8 pt-24 md:px-12">
        <div className="flex items-start justify-between">
          <div className="ty-in">
            <p className="label">03 — Type on it</p>
            <h2 className="mt-4 font-display text-[clamp(1.6rem,3.4vw,3rem)] font-bold leading-[1] tracking-tight">
              Go ahead.<br />Type something.
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setSound(!soundOn)}
            aria-pressed={soundOn}
            className="ty-in pointer-events-auto label flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 transition-colors hover:border-kairo hover:text-bone"
          >
            <span className={`h-2 w-2 rounded-full ${soundOn ? 'bg-kairo' : 'bg-white/25'}`} />
            Sound {soundOn ? 'on' : 'off'}
          </button>
        </div>

        {/* what the visitor typed: last 28 characters, big. aria-live so screen readers hear it too */}
        <div className="ty-in mt-8 flex min-h-[1.2em] flex-1 items-start md:mt-10">
          <p
            aria-live="polite"
            className="max-w-full whitespace-pre font-display text-[clamp(2.6rem,9vw,8.5rem)] font-bold leading-none tracking-[-0.04em]"
          >
            {typed.slice(-28)}
            <span className="caret ml-1 inline-block h-[0.8em] w-[0.08em] translate-y-[0.08em] bg-kairo" />
          </p>
        </div>

        <p className="ty-in label">
          <span className="hidden md:inline">Press any key on your keyboard</span>
          <span className="md:hidden">Tap the keys</span>
        </p>
      </div>
    </section>
  )
}
