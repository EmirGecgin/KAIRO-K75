import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Small dot that follows the mouse, grows over [data-cursor] / links / buttons.
 * mix-blend-mode: difference keeps it visible on any background.
 * Only mounts on fine pointers >= 768px.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const enabled = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches
    const el = ref.current
    if (!enabled || !el) return
    document.documentElement.classList.add('has-cursor')

    // quickTo reuses one tween per property: cheap and smooth vs. creating tweens each mousemove
    const x = gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power3' })
    const y = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power3' })

    const move = (e: MouseEvent) => { x(e.clientX); y(e.clientY) }
    const over = (e: MouseEvent) => {
      const hot = (e.target as HTMLElement).closest('a, button, [data-cursor]')
      gsap.to(el, { scale: hot ? 3.5 : 1, duration: 0.3, ease: 'power3.out' })
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference md:block"
      style={{ willChange: 'transform' }}
    />
  )
}
