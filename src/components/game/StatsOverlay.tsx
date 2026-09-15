import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { pad2 } from '../../lib/utils'

interface StatsOverlayProps {
  show: boolean
  sceneId: string
  step: number
  steps: number
  chapterLabel: string
  startedAt: number
  unlocked: number
  totalAchievements: number
}

/** Engine-style stats panel. FPS and frame time are measured live; the timer helps pace the talk. */
export function StatsOverlay({ show, sceneId, step, steps, chapterLabel, startedAt, unlocked, totalAchievements }: StatsOverlayProps) {
  const fpsRef = useRef<HTMLSpanElement>(null)
  const msRef = useRef<HTMLSpanElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!show) return
    let raf = 0
    let frames = 0
    let windowStart = performance.now()
    let last = windowStart
    let worst = 0
    const loop = (now: number) => {
      frames++
      worst = Math.max(worst, now - last)
      last = now
      if (now - windowStart >= 500) {
        const fps = (frames * 1000) / (now - windowStart)
        if (fpsRef.current) fpsRef.current.textContent = fps.toFixed(0)
        if (msRef.current) msRef.current.textContent = `${((now - windowStart) / frames).toFixed(1)} ms · worst ${worst.toFixed(0)}`
        const elapsed = Math.floor((Date.now() - startedAt) / 1000)
        if (timeRef.current) timeRef.current.textContent = `${pad2(Math.floor(elapsed / 60))}:${pad2(elapsed % 60)}`
        frames = 0
        worst = 0
        windowStart = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [show, startedAt])

  const rows: Array<[string, ReactNode]> = [
    ['FPS', <span ref={fpsRef}>—</span>],
    ['Frame', <span ref={msRef}>—</span>],
    ['Scene', sceneId],
    ['Step', `${step + 1} / ${steps}`],
    ['Chapter', chapterLabel],
    ['Achv', `${unlocked} / ${totalAchievements}`],
    ['Timer', <span ref={timeRef}>00:00</span>],
  ]

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          className="pointer-events-none absolute top-20 left-8 z-40 w-64 rounded-lg border border-white/10 bg-black/70 p-3 font-mono text-[0.68rem] backdrop-blur-sm"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          aria-label="Engine stats"
        >
          <p className="mb-2 font-mono text-[0.62rem] tracking-[0.22em] text-[#5FE0A0] uppercase">Stats</p>
          <dl className="grid grid-cols-[4.2rem_1fr] gap-x-2 gap-y-1">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-faint uppercase">{k}</dt>
                <dd className="truncate text-paper tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
