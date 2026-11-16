import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { PRODUCT } from '../../data/content'

gsap.registerPlugin(ScrollTrigger)

const LINKS = [
  { href: '#specs', label: 'Specs' },
  { href: '#colorways', label: 'Colorways' },
  { href: '#rgb', label: 'Lighting' },
  { href: '#cta', label: 'Pre-order' },
]

/** The wordmark sits inside an overflow-hidden box and slides up as the footer scrolls in (scrubbed, transform only). */
export default function Footer() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo(
        '.ft-word',
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'bottom bottom', scrub: true } },
      )
    },
    { scope: root },
  )

  return (
    <footer ref={root} id="footer" className="relative px-6 pb-6 pt-24 md:px-12">
      <div className="flex flex-wrap items-start justify-between gap-10 border-t border-white/10 pt-8">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="label transition-colors hover:text-bone">{l.label}</a>
          ))}
        </nav>
        <a href="#hero" className="label transition-colors hover:text-bone">Back to top ↑</a>
      </div>

      <div className="mt-10 overflow-hidden">
        <p
          className="ft-word select-none text-center font-display text-[clamp(5rem,36vw,40rem)] font-bold leading-[0.8] tracking-[-0.06em] will-change-transform"
          aria-label="KAIRO"
        >
          KAIRO
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="label">{PRODUCT.note}</p>
        <p className="label">© 2026 · {PRODUCT.name}</p>
      </div>
    </footer>
  )
}
