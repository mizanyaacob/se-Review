import { AnimatePresence, motion } from 'motion/react'
import type { SceneProps } from '../chapters/types'
import { epilogue, person } from '../data/selfEvaluation'
import { COLORS, EASE_OUT, cn } from '../lib/utils'
import { Stage } from './Stage'

/**
 * The closing narrative, one line per beat, then the two final statements.
 * Beats: reveal lines (7) + 2.
 */
export function FinalReveal({ beat }: SceneProps) {
  const lines = epilogue.reveal
  const finalPhase = beat >= lines.length
  const highlight = COLORS.warn

  return (
    <Stage wide>
      <AnimatePresence mode="wait">
        {!finalPhase ? (
          <motion.ol key="lines" className="space-y-3" exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }} transition={{ duration: 0.6 }}>
            {lines.map((line, i) => {
              const visible = beat >= i
              const current = beat === i
              return (
                <motion.li
                  key={line}
                  className={cn('display origin-left', i === lines.length - 1 ? 'text-[clamp(2rem,3.6vw,3.6rem)]' : 'text-[clamp(1.8rem,3.1vw,3.1rem)]')}
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={visible ? { opacity: current ? 1 : 0.28, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.9, ease: EASE_OUT }}
                  aria-hidden={!visible}
                >
                  {line}
                </motion.li>
              )
            })}
          </motion.ol>
        ) : (
          <motion.div key="final" className="flex flex-col items-center text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <motion.p
              className="display text-[clamp(2.6rem,5vw,5.4rem)]"
              initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
              animate={{ opacity: beat >= lines.length + 1 ? 0.45 : 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.1, ease: EASE_OUT }}
            >
              {epilogue.finalA}
            </motion.p>
            <motion.p
              className="display mt-8 text-[clamp(3rem,6.2vw,6.8rem)]"
              initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
              animate={beat >= lines.length + 1 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 30, filter: 'blur(12px)' }}
              transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.2 }}
            >
              {epilogue.finalB.replace(/contribution\.$/, '')}
              <span style={{ color: highlight }}>contribution.</span>
            </motion.p>
            <motion.p
              className="mt-16 font-mono text-[0.72rem] tracking-[0.24em] text-dim uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: beat >= lines.length + 1 ? 1 : 0 }}
              transition={{ duration: 1, delay: 1.4 }}
            >
              {person.shortName} · {person.role} · {person.studio}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  )
}
