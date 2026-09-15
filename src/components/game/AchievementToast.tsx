import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { achievements, chapterById, type Achievement } from '../../data/selfEvaluation'
import { EASE_OUT, hexA } from '../../lib/utils'
import { AchievementBadge } from './AchievementBadge'

const noise = (i: number, salt: number) => {
  const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return s - Math.floor(s)
}

/** Slides up bottom-right with a small pixel burst, then dismisses itself. */
export function AchievementToast({ achievement, unlockedCount, onDone }: { achievement: Achievement | null; unlockedCount: number; onDone: () => void }) {
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!achievement) return
    const t = window.setTimeout(onDone, 3600)
    return () => window.clearTimeout(t)
  }, [achievement, onDone])

  return (
    <div className="pointer-events-none absolute right-8 bottom-20 z-50" aria-live="polite">
      <AnimatePresence mode="wait">
        {achievement && (
          <motion.div
            key={achievement.id}
            role="status"
            className="relative"
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, transition: { duration: 0.3 } }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
          >
            <Toast achievement={achievement} unlockedCount={unlockedCount} burst={!reduce} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Toast({ achievement, unlockedCount, burst }: { achievement: Achievement; unlockedCount: number; burst: boolean }) {
  const accent = chapterById(achievement.chapter).accent

  return (
    <div className="flex w-[380px] items-center gap-4 overflow-hidden rounded-2xl border bg-ink-2/95 py-3.5 pr-5 pl-3.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md" style={{ borderColor: hexA(accent, 0.45) }}>
      {/* shine sweep */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-24 -skew-x-12"
        style={{ background: `linear-gradient(90deg, transparent, ${hexA(accent, 0.18)}, transparent)` }}
        initial={{ left: '-30%' }}
        animate={{ left: '130%' }}
        transition={{ duration: 1.1, delay: 0.35, ease: 'easeInOut' }}
      />

      <span className="relative">
        {burst &&
          Array.from({ length: 14 }, (_, i) => {
            const angle = (i / 14) * Math.PI * 2 + noise(i, 1)
            const dist = 34 + noise(i, 2) * 26
            return (
              <motion.span
                key={i}
                aria-hidden
                className="absolute top-1/2 left-1/2 size-1.5"
                style={{ background: i % 3 === 0 ? '#ECE9E2' : accent }}
                initial={{ x: -3, y: -3, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(angle) * dist - 3, y: Math.sin(angle) * dist - 3, opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.8 + noise(i, 3) * 0.4, delay: 0.25, ease: 'easeOut' }}
              />
            )
          })}
        <motion.span className="block" initial={{ rotate: -90, scale: 0.4 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}>
          <AchievementBadge icon={achievement.icon} accent={accent} size={52} />
        </motion.span>
      </span>

      <span className="relative min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <span className="font-mono text-[0.62rem] tracking-[0.2em] uppercase" style={{ color: accent }}>
            Achievement unlocked
          </span>
          <span className="font-mono text-[0.62rem] text-faint tabular-nums">
            {unlockedCount}/{achievements.length}
          </span>
        </span>
        <span className="mt-1 block text-[1.08rem] leading-tight font-semibold tracking-tight">{achievement.title}</span>
        <span className="mt-0.5 block text-[0.86rem] leading-snug text-dim">{achievement.description}</span>
      </span>
    </div>
  )
}
