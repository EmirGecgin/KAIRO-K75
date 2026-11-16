import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

interface Props { to: number; decimals?: number; duration?: number; className?: string }

/** Counts 0 → `to` the first time it scrolls into view. Writes textContent directly: no React re-render per frame. */
export default function Counter({ to, decimals = 0, duration = 2, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

  useGSAP(() => {
    const el = ref.current!
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return }
    const o = { v: 0 }
    gsap.to(o, {
      v: to, duration, ease: 'power3.out',
      onUpdate: () => { el.textContent = fmt(o.v) },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
  }, { scope: ref })

  return <span ref={ref} className={className} aria-label={fmt(to)}>{fmt(0)}</span>
}
