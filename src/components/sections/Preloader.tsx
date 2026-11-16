import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSceneStore } from '../../store/useSceneStore'

const LETTERS = ['K', 'A', 'I', 'R', 'O']

/**
 * 000 → 100 counter while the letters K-A-I-R-O "type" themselves like keys being pressed.
 * Then the content fades, and two panels slide apart from the middle to reveal the hero.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const html = document.documentElement
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      // 'is-loading' (scroll lock) is set statically on <html> in index.html so there is no unlocked flash; removed in onComplete
      window.scrollTo(0, 0)

      const counter = { v: 0 }
      const dur = reduced ? 0.5 : 2.6
      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          root.current!.style.display = 'none'
          html.classList.remove('is-loading')
        },
      })

      // 1) the number counts up (onUpdate writes text directly: no React re-render 60x/sec)
      tl.to(counter, {
        v: 100, duration: dur, ease: 'power2.inOut',
        onUpdate: () => { num.current!.textContent = String(Math.round(counter.v)).padStart(3, '0') },
      }, 0)

      // 2) each cap drops in, gets pressed (y: 0), then springs back up to its resting height (y: -8)
      if (!reduced) {
        gsap.utils.toArray<HTMLElement>('.pre-cap').forEach((cap, i) => {
          const at = 0.35 + i * (dur - 0.9) / LETTERS.length
          tl.fromTo(cap, { y: -70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: 'power2.in' }, at)
            .to(cap, { y: -8, duration: 0.4, ease: 'back.out(3)' }, at + 0.28)
        })
      } else {
        gsap.set('.pre-cap', { y: -8, opacity: 1 })
      }

      // 3) exit: content out, centre line draws, panels split apart
      tl.to('.pre-content', { opacity: 0, y: -16, duration: 0.4, ease: 'power2.in' }, dur + 0.25)
        .fromTo('.pre-line', { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'expo.inOut' }, '<0.1')
        .to('.pre-top', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '>0.05')
        .to('.pre-bottom', { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, '<')
        .to('.pre-line', { opacity: 0, duration: 0.3 }, '<')
        // hero text + keyboard intro start while the panels are still opening
        .call(() => useSceneStore.getState().setLoaded(true), undefined, '<0.35')

      // don't start until fonts are in (or 2.5s passed) so the letters don't swap font mid-animation
      // `dead` guards React StrictMode's mount→cleanup→mount: the discarded first run must never play
      let dead = false
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]).then(() => { if (!dead) tl.play() })
      return () => { dead = true }
    },
    { scope: root },
  )

  return (
    <div ref={root} className="fixed inset-0 z-[9990]" role="status" aria-label="Loading">
      <div className="pre-top absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div className="pre-bottom absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <div className="pre-line absolute left-0 top-1/2 h-px w-full origin-center scale-x-0 bg-kairo" />

      <div className="pre-content absolute inset-0 flex flex-col items-center justify-center gap-10">
        <span ref={num} className="font-mono text-6xl tabular-nums tracking-widest text-bone md:text-8xl">000</span>
        <div className="flex gap-2 md:gap-3" aria-hidden>
          {LETTERS.map((l) => (
            <div key={l} className="relative h-14 w-14 md:h-20 md:w-20">
              <div className="absolute inset-0 rounded-xl bg-[#2c2a35]" />
              <div className="pre-cap absolute inset-0 grid place-items-center rounded-xl bg-bone font-display text-2xl font-bold text-ink opacity-0 md:text-4xl">
                {l}
              </div>
            </div>
          ))}
        </div>
        <span className="label">Loading K75</span>
      </div>
    </div>
  )
}
