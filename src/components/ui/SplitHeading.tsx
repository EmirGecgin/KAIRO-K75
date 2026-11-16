import { useRef, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText)

interface Props { as?: ElementType; className?: string; children: ReactNode; start?: string }

/**
 * Headline that reveals line by line from behind a mask when scrolled into view.
 * `autoSplit` re-splits on resize / font load so lines stay correct; returning the tween from onSplit
 * lets SplitText re-create the animation for the new split instead of leaving it half-played.
 */
export default function SplitHeading({ as: Tag = 'h2', className, children, start = 'top 82%' }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    SplitText.create(ref.current!, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.12,
          scrollTrigger: { trigger: ref.current, start, once: true },
        }),
    })
  }, { scope: ref })

  return <Tag ref={ref} className={`split-h ${className ?? ''}`}>{children}</Tag>
}
