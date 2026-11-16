import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSceneStore } from '../../store/useSceneStore'
import Counter from '../ui/Counter'

gsap.registerPlugin(ScrollTrigger)

/**
 * Bento cell. The animated border is a big conic-gradient square that spins behind a 1px inset:
 * spinning is a pure transform, so it costs nothing on the main thread. Visible only on hover.
 */
function Cell({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`spec-cell group relative overflow-hidden rounded-3xl p-px transition-transform duration-500 ease-out hover:scale-[1.02] ${className}`}>
      <span className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_250deg,var(--color-kairo)_330deg,transparent_360deg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute inset-0 rounded-3xl border border-white/10" />
      <div className="relative flex h-full flex-col justify-between rounded-[23px] bg-[#101014] p-6 md:p-8">{children}</div>
    </div>
  )
}

export default function Specs() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      gsap.from('.spec-in', {
        opacity: 0, y: reduced ? 0 : 50, duration: 0.9, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
      })

      // keyboard stays off-stage while the grid is up
      const clamp = gsap.utils.clamp(0, 1)
      ScrollTrigger.create({
        trigger: root.current, start: 'top bottom', end: 'bottom top',
        onUpdate: (self) => {
          const vh = window.innerHeight
          const y = self.scroll()
          const inn = clamp((y - self.start) / (vh * 0.6))
          // the keyboard returns once the grid is mostly scrolled past; never before it has fully left (short sections!)
          const outStart = Math.max(self.end - vh * 0.7, self.start + vh * 0.6)
          const out = clamp((y - outStart) / (vh * 0.5))
          useSceneStore.setState({ hide: inn * (1 - out) })
        },
        onLeave: () => useSceneStore.setState({ hide: 0 }),
        onLeaveBack: () => useSceneStore.setState({ hide: 0 }),
      })
      return () => useSceneStore.setState({ hide: 0 })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="specs" className="relative px-6 py-32 md:px-12">
      <div className="spec-in">
        <p className="label">06 — Specs</p>
        <h2 className="mt-4 font-display text-[clamp(2.4rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
          Numbers that<br />actually matter.
        </h2>
      </div>

      <div className="mt-14 grid auto-rows-[minmax(11rem,auto)] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Cell className="spec-in col-span-2 row-span-2">
          <p className="label">Battery</p>
          <div>
            <p className="font-display text-[clamp(4.5rem,13vw,11rem)] font-bold leading-[0.85] tracking-[-0.05em]">
              <Counter to={4000} duration={2.4} />
            </p>
            <p className="mt-3 font-mono text-sm uppercase tracking-[0.2em] text-kairo">mAh</p>
            <p className="mt-4 max-w-xs text-sm text-mute">Up to 200 hours with lighting off. Charges fully in about two hours over USB-C.</p>
          </div>
        </Cell>

        <Cell className="spec-in col-span-2">
          <p className="label">Connectivity</p>
          <div className="flex flex-wrap gap-2">
            {['2.4 GHz', 'Bluetooth 5.1', 'USB-C'].map((c) => (
              <span key={c} className="rounded-full border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em]">{c}</span>
            ))}
          </div>
          <p className="text-sm text-mute">Pair three devices, switch with a keystroke.</p>
        </Cell>

        <Cell className="spec-in">
          <p className="label">Polling rate</p>
          <p className="font-display text-5xl font-bold tracking-tight md:text-6xl">
            <Counter to={1000} /><span className="ml-1 font-mono text-sm text-kairo">Hz</span>
          </p>
        </Cell>

        <Cell className="spec-in">
          <p className="label">Weight</p>
          <p className="font-display text-5xl font-bold tracking-tight md:text-6xl">
            <Counter to={1.1} decimals={1} /><span className="ml-1 font-mono text-sm text-kairo">kg</span>
          </p>
        </Cell>

        <Cell className="spec-in col-span-2">
          <p className="label">Material</p>
          <p className="font-display text-3xl font-bold tracking-tight md:text-5xl">6063 aluminium</p>
          <p className="text-sm text-mute">CNC-milled from one billet, bead-blasted and anodised.</p>
        </Cell>

        <Cell className="spec-in col-span-2">
          <p className="label">Hot-swap</p>
          <p className="font-display text-3xl font-bold tracking-tight md:text-5xl">Pull. Pop. Play.</p>
          <p className="text-sm text-mute">5-pin sockets accept any MX-style switch across all 83 keys.</p>
        </Cell>
      </div>
    </section>
  )
}
