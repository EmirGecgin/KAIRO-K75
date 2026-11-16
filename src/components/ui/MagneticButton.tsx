import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

interface Props { children: ReactNode; onClick?: () => void; className?: string; reach?: number }

/**
 * Button that leans toward the pointer once it comes within `reach` px, and springs back when it leaves.
 * The label moves a bit further than the shell (parallax) which sells the "pull".
 * quickTo keeps one reusable tween per axis; the listener lives on window so the pull starts BEFORE hovering.
 * Off on touch devices and with reduced motion.
 */
export default function MagneticButton({ children, onClick, className = '', reach = 110 }: Props) {
  const btn = useRef<HTMLButtonElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = btn.current!, lb = label.current!
    const opt = { duration: 0.7, ease: 'elastic.out(1, 0.35)' }
    const bx = gsap.quickTo(el, 'x', opt), by = gsap.quickTo(el, 'y', opt)
    const lx = gsap.quickTo(lb, 'x', opt), ly = gsap.quickTo(lb, 'y', opt)
    let inside = false

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const near = Math.abs(dx) < r.width / 2 + reach && Math.abs(dy) < r.height / 2 + reach
      if (near) { inside = true; bx(dx * 0.35); by(dy * 0.35); lx(dx * 0.18); ly(dy * 0.18) }
      else if (inside) { inside = false; bx(0); by(0); lx(0); ly(0) }
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, { scope: btn })

  return (
    <button
      ref={btn}
      type="button"
      onClick={onClick}
      className={`will-change-transform ${className}`}
    >
      <span ref={label} className="inline-flex items-center gap-3 will-change-transform">{children}</span>
    </button>
  )
}
