import { AnimatePresence, motion } from 'motion/react'
import { useMouseParallax } from '../hooks/useMouseParallax'
import { hexA } from '../lib/utils'

/** Grid + chapter-tinted light. Only opacity and transforms animate, so it stays cheap. */
export function Backdrop({ accent, glowKey }: { accent: string; glowKey: string }) {
  const { x, y } = useMouseParallax(14)

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div className="grid-backdrop absolute -inset-16" style={{ x, y }} />
      <AnimatePresence>
        <motion.div
          key={glowKey}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          style={{
            background: `radial-gradient(55% 45% at 82% 8%, ${hexA(accent, 0.11)}, transparent 70%), radial-gradient(45% 40% at 8% 100%, ${hexA(accent, 0.06)}, transparent 70%)`,
          }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  )
}
