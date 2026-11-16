import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles/index.css'
import App from './App'

import gsap from 'gsap'

// Never let GSAP "catch up" after a slow frame: animations follow real time. This must be global (not inside the Lenis
// hook) because with reduced motion Lenis is off, and a single heavy WebGL frame would otherwise freeze the preloader.
gsap.ticker.lagSmoothing(0)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
