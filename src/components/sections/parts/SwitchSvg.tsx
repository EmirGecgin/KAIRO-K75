import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

type Kind = 'linear' | 'tactile' | 'clicky'

/**
 * A cutaway switch drawn in SVG (housing, spring, stem). The loop shows each switch's *feel*:
 *  linear  → one smooth, even stroke
 *  tactile → resists, a bump near 40% (the stem hesitates then snaps), then bottoms out
 *  clicky  → fast stroke + a ring pulse (the click) on actuation
 * Only transforms/opacity move; the loop is created once and killed with the component.
 */
export default function SwitchSvg({ kind }: { kind: Kind }) {
  const root = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const D = 34 // stem travel in svg units
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5, delay: Math.random() * 0.6 })
    const press = (y: number, d: number, ease: string) =>
      tl.to('.sw-stem', { y, duration: d, ease }, '>').to('.sw-spring', { scaleY: 1 - (y / D) * 0.55, duration: d, ease }, '<')

    if (kind === 'linear') {
      press(D, 0.7, 'sine.inOut')
    } else if (kind === 'tactile') {
      press(13, 0.35, 'power2.in') // climbing the bump
      tl.to('.sw-bump', { opacity: 1, duration: 0.08 }, '<0.2').to({}, { duration: 0.12 })
      press(D, 0.14, 'power4.out') // …and over it, snap
      tl.to('.sw-bump', { opacity: 0.25, duration: 0.2 }, '<')
    } else {
      press(D, 0.18, 'power3.in')
      tl.fromTo('.sw-ring', { scale: 0.6, opacity: 1 }, { scale: 1.9, opacity: 0, duration: 0.45, ease: 'power2.out' }, '<0.08')
    }
    tl.to({}, { duration: 0.25 })
    press(0, 0.55, 'power2.out') // release
  }, { scope: root })

  return (
    <svg ref={root} viewBox="0 0 200 250" className="h-full w-full" fill="none" role="img" aria-label={`${kind} switch cutaway`}>
      {/* bottom housing */}
      <rect x="38" y="150" width="124" height="78" rx="10" fill="#26262b" stroke="rgba(239,236,228,.18)" />
      {/* pins */}
      <path d="M78 228v14M122 228v14" stroke="rgba(239,236,228,.35)" strokeWidth="3" strokeLinecap="round" />
      {/* spring: pivots at its base so it squashes toward the floor */}
      <path
        className="sw-spring [transform-box:fill-box] origin-bottom"
        d="M100 148l-18 -8 36 -9 -36 -9 36 -9 -36 -9 36 -9 -18 -7"
        stroke="rgba(239,236,228,.55)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* top housing: outline only, so you see inside */}
      <path d="M50 150V70a10 10 0 0 1 10-10h80a10 10 0 0 1 10 10v80" stroke="rgba(239,236,228,.3)" strokeWidth="2" />
      {/* tactile bump marker on the leaf */}
      <path className="sw-bump" opacity={kind === 'tactile' ? 0.25 : 0} d="M150 105l-12 8 12 8z" fill="var(--color-kairo)" />
      {/* click ring */}
      <circle className="sw-ring [transform-box:fill-box] origin-center" cx="100" cy="150" r="34" stroke="var(--color-kairo)" strokeWidth="2" opacity="0" />
      {/* stem + cap interface */}
      <g className="sw-stem">
        <rect x="92" y="28" width="16" height="84" rx="3" fill="var(--color-kairo)" />
        <rect x="74" y="14" width="52" height="16" rx="4" fill="#efece4" />
        <rect x="96" y="110" width="8" height="26" rx="2" fill="var(--color-kairo)" opacity=".6" />
      </g>
    </svg>
  )
}
