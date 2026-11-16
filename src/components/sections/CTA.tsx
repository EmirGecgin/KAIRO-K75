import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSceneStore } from '../../store/useSceneStore'
import { useKeyRain } from '../../hooks/useKeyRain'
import { PRODUCT } from '../../data/content'
import SplitHeading from '../ui/SplitHeading'
import MagneticButton from '../ui/MagneticButton'
const ConceptModal = lazy(() => import('../ui/ConceptModal'))

gsap.registerPlugin(ScrollTrigger)

export default function CTA() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const rain = useKeyRain(canvas)
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(false) // the modal chunk is fetched on first click only
  const close = useCallback(() => setOpen(false), [])

  useGSAP(
    () => {
      // the 3D board leaves the stage on the way in: this section is about the typography and the falling caps
      ScrollTrigger.create({
        trigger: root.current, start: 'top bottom', end: 'top 20%',
        onUpdate: (self) => useSceneStore.setState({ hide: self.progress }),
        onLeaveBack: () => useSceneStore.setState({ hide: 0 }),
      })
      gsap.from('.cta-in', {
        opacity: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: 'top 45%', once: true },
      })
      return () => useSceneStore.setState({ hide: 0 })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="cta" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 py-32 md:px-12">
      {/* falling keycaps live behind the text */}
      <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />

      <div className="relative">
        <p className="label cta-in">08 — Pre-order</p>
        <SplitHeading className="mt-6 font-display text-[clamp(3rem,11.5vw,11rem)] font-bold leading-[0.9] tracking-[-0.045em]">
          Your next keystroke starts here.
        </SplitHeading>

        <div className="mt-14 flex flex-wrap items-center gap-x-12 gap-y-8">
          <div className="cta-in">
            <p className="font-display text-5xl font-bold tracking-tight md:text-7xl">{PRODUCT.price}</p>
            <p className="label mt-2">Pre-order price · ships 2027</p>
          </div>

          <div
            className="cta-in"
            onPointerEnter={() => rain.current.setActive(true)}
            onPointerLeave={() => rain.current.setActive(false)}
          >
            <MagneticButton
              onClick={() => { rain.current.burst(36); setOpen(true); setSeen(true) }}
              className="rounded-full bg-kairo px-10 py-6 font-display text-xl font-bold text-ink md:px-14 md:py-8 md:text-2xl"
            >
              Pre-order <span aria-hidden>→</span>
            </MagneticButton>
          </div>
        </div>
      </div>

      {seen && (
        <Suspense fallback={null}>
          <ConceptModal open={open} onClose={close} />
        </Suspense>
      )}
    </section>
  )
}
