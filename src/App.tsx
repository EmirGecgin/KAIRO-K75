import { useLenis } from './hooks/useLenis'
import { useKeyPress } from './hooks/useKeyPress'
import { lazy, Suspense, useEffect, useState } from 'react'
import { LazyMotion, domAnimation } from 'motion/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// Three.js + R3F live in their own chunk. It is requested only once the page has loaded and the browser is idle (see App),
// so the preloader paints and becomes interactive first; the 2.6 s preloader hides the scene's setup / shader compilation.
const Scene = lazy(() => import('./components/canvas/Scene'))
import Cursor from './components/ui/Cursor'
import Preloader from './components/sections/Preloader'
import Hero from './components/sections/Hero'
import Exploded from './components/sections/Exploded'
import TypeOnIt from './components/sections/TypeOnIt'
import Switches from './components/sections/Switches'
import RGB from './components/sections/RGB'
import Specs from './components/sections/Specs'
import Colorways from './components/sections/Colorways'
import CTA from './components/sections/CTA'
import Footer from './components/sections/Footer'

export default function App() {
  useLenis()
  const [sceneReady, setSceneReady] = useState(false)
  useEffect(() => {
    let cancelled = false
    const start = () => {
      const run = () => { if (!cancelled) setSceneReady(true) }
      if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 1500 })
      else setTimeout(run, 300)
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => { cancelled = true; window.removeEventListener('load', start) }
  }, [])
  useKeyPress()
  // pins and sticky heights depend on font metrics: re-measure every trigger once fonts are in
  useEffect(() => { void document.fonts.ready.then(() => ScrollTrigger.refresh()) }, [])
  return (
    <LazyMotion features={domAnimation} strict>
      {sceneReady && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}
      <Cursor />
      <Preloader />
      <main className="relative z-10">
        <Hero />
        <Exploded />
        <TypeOnIt />
        <Switches />
        <RGB />
        <Specs />
        <Colorways />
        <CTA />
      </main>
      <Footer />
    </LazyMotion>
  )
}
