import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'

/** Small dialog shown when "Pre-order" is clicked. Esc / backdrop / button close it; focus moves in and returns. */
export default function ConceptModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    document.documentElement.classList.add('modal-open') // freeze page scroll
    closeBtn.current?.focus()
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('keydown', key)
      document.documentElement.classList.remove('modal-open')
      prev?.focus?.()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[9500] grid place-items-center bg-black/60 p-6 backdrop-blur-md"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <m.div
            role="dialog" aria-modal="true" aria-labelledby="cm-title"
            className="w-full max-w-md rounded-3xl border border-white/15 bg-[#101014] p-8 text-center"
            initial={{ opacity: 0, y: 30, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="label text-kairo">Concept project</p>
            <h3 id="cm-title" className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight">
              This is a concept project — thanks for exploring!
            </h3>
            <p className="mt-3 text-sm text-mute">KAIRO is fictional. Nothing is for sale, and nothing was charged.</p>
            <button
              ref={closeBtn} type="button" onClick={onClose}
              className="label mt-8 rounded-full border border-white/20 px-6 py-3 transition-colors hover:border-kairo hover:text-bone"
            >
              Close
            </button>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
