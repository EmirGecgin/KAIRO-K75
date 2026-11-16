import { useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { useSceneStore } from '../../store/useSceneStore'
import { PRODUCT } from '../../data/content'

gsap.registerPlugin(SplitText)

/**
 * The 3D keyboard lives in the fixed canvas behind this section; Hero only owns the HTML layer.
 * Headline: SplitText cuts "ENGINEERED." into characters, each wrapped in a clipping mask,
 * so letters slide up out of an invisible floor instead of just fading in.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const h1 = useRef<HTMLHeadingElement>(null)
  const loaded = useSceneStore((s) => s.loaded)
  const chars = useRef<HTMLElement[]>([])

  // setup: split once fonts are ready (otherwise measurements use the fallback font) and park the letters below the mask
  useGSAP(
    () => {
      gsap.set('.hero-fade', { opacity: 0, y: 12 })
      let split: SplitText | undefined
      document.fonts.ready.then(() => {
        split = SplitText.create(h1.current!, { type: 'chars', mask: 'chars', charsClass: 'hero-char' })
        chars.current = split.chars as HTMLElement[]
        chars.current[chars.current.length - 1].style.color = 'var(--color-kairo)' // the full stop
        gsap.set(chars.current, { yPercent: 115 })
        gsap.set(h1.current, { autoAlpha: 1 })
        if (useSceneStore.getState().loaded) play()
      })
      return () => split?.revert()
    },
    { scope: root },
  )

  const play = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      gsap.set(chars.current, { yPercent: 0 })
      gsap.set('.hero-fade', { opacity: 1, y: 0 })
      return
    }
    gsap.to(chars.current, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.045 })
    gsap.to('.hero-fade', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.5 })
  }

  // preloader finished opening → run the intro
  useGSAP(() => { if (loaded && chars.current.length) play() }, { dependencies: [loaded], scope: root })

  return (
    <section ref={root} id="hero" className="relative flex min-h-[100svh] flex-col justify-between px-6 pb-8 pt-24 md:px-12">
      <div className="hero-fade label flex items-center justify-between">
        <span className="text-bone">{PRODUCT.name}</span>
        <span className="hidden md:inline">Wireless · Gasket-mount · 75%</span>
        <span>Pre-order {PRODUCT.price}</span>
      </div>

      <div>
        <h1
          ref={h1}
          className="invisible whitespace-nowrap font-display text-[15.6vw] font-bold uppercase leading-[0.9] tracking-[-0.045em] text-bone"
        >
          Engineered.
        </h1>
        <div className="mt-6 flex items-end justify-between gap-6">
          <p className="hero-fade max-w-[16rem] text-sm text-mute md:text-base">{PRODUCT.tagline}</p>
          <div className="hero-fade flex flex-col items-center gap-3">
            <span className="label">Scroll to explore</span>
            <span className="relative block h-10 w-px overflow-hidden bg-white/15">
              <span className="scroll-cue absolute inset-0 bg-kairo" />
            </span>
          </div>
          <p className="hero-fade label hidden whitespace-nowrap text-right md:block">83 keys · 4000 mAh · Hot-swap</p>
        </div>
      </div>
    </section>
  )
}
