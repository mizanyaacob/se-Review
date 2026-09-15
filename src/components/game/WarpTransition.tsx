import { Rocket } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { chapterById, chapters, loadingTips, person, type ChapterId } from '../../data/selfEvaluation'
import { sfx } from '../../lib/sfx'
import { EASE_OUT, cn, pad2 } from '../../lib/utils'
import { createFlight, type FlightKind } from './flightScene'

export const flightKind = (chapter: ChapterId): FlightKind => (chapter === 'prologue' ? 'launch' : chapter === 'personal' ? 'land' : 'warp')

export const FLIGHT_MS: Record<FlightKind, number> = { launch: 2900, warp: 2500, land: 2700 }

/** Where the iris closes: the point the rocket heads for, so space collapses into it. */
const IRIS: Record<FlightKind, string> = { launch: '64% 0%', warp: '84% 40%', land: '66% 60%' }

const AMBER = '#F5A83C'

/** Chapter transition: rocket launch (story start), warp flight between chapters, landing for the personal chapter. */
export function WarpTransition({ chapter, show, onSkip }: { chapter: ChapterId; show: boolean; onSkip: () => void }) {
  const kind = flightKind(chapter)
  const iris = IRIS[kind]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={chapter}
          className="absolute inset-0 z-[45] cursor-pointer overflow-hidden bg-ink"
          initial={{ opacity: 0, clipPath: `circle(150% at ${iris})` }}
          animate={{ opacity: 1, clipPath: `circle(150% at ${iris})` }}
          exit={{ clipPath: `circle(0% at ${iris})`, transition: { duration: 0.7, ease: [0.7, 0, 0.84, 0] } }}
          transition={{ duration: 0.2 }}
          onClick={onSkip}
          role="status"
          aria-label={`Travelling to ${chapterById(chapter).label}`}
        >
          <Flight chapter={chapter} kind={kind} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Flight({ chapter, kind }: { chapter: ChapterId; kind: FlightKind }) {
  const reduce = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const meta = chapterById(chapter)
  const accent = chapter === 'prologue' || chapter === 'epilogue' ? AMBER : meta.accent
  const duration = FLIGHT_MS[kind]
  const [countdown, setCountdown] = useState(kind === 'launch' ? '3' : '')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const flight = createFlight(canvas, {
      kind,
      accent,
      durationMs: duration,
      planetLabel: meta.goal ? pad2(meta.goal) : chapter === 'epilogue' ? '★' : undefined,
      ringed: chapter === 'working' || chapter === 'epilogue',
    })
    if (reduce) {
      flight.drawStatic()
      return
    }
    let raf = 0
    const loop = (now: number) => {
      flight.frame(now)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    const onResize = () => flight.resize()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [kind, accent, duration, chapter, meta.goal, reduce])

  // Sound + countdown cues, timed to the canvas choreography.
  useEffect(() => {
    const at = (fraction: number, fn: () => void) => window.setTimeout(fn, fraction * duration)
    const timers: number[] = []
    if (kind === 'launch') {
      sfx.play('step')
      timers.push(at(0.12, () => (setCountdown('2'), sfx.play('step'))))
      timers.push(at(0.24, () => (setCountdown('1'), sfx.play('step'))))
      timers.push(at(0.36, () => (setCountdown('Lift off'), sfx.noise('liftoff'))))
    } else if (kind === 'warp') {
      sfx.noise('whoosh')
      timers.push(at(0.7, () => sfx.play('load')))
    } else {
      sfx.noise('whoosh')
      timers.push(at(0.82, () => sfx.noise('thud')))
    }
    return () => timers.forEach(window.clearTimeout)
  }, [kind, duration])

  const eyebrow =
    kind === 'launch' ? (
      <span className="inline-flex items-center gap-4">
        Launch sequence
        <AnimatePresence mode="wait">
          <motion.span key={countdown} className="inline-block text-paper" initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {countdown}
          </motion.span>
        </AnimatePresence>
      </span>
    ) : kind === 'land' ? (
      `Landing · Goal ${pad2(meta.goal ?? 0)}`
    ) : chapter === 'epilogue' ? (
      'Final approach'
    ) : (
      `Warping to · Goal ${pad2(meta.goal ?? 0)}`
    )

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/80 to-transparent px-8 pt-24 pb-14 md:px-14">
        <div className="mx-auto w-full max-w-[1240px]">
          <motion.p className="font-pixel text-[16px] tracking-[2px] uppercase" style={{ color: accent }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {eyebrow}
          </motion.p>
          <motion.h2
            className="display mt-4 max-w-[18ch] text-[clamp(3rem,6vw,6.2rem)]"
            initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.15 }}
          >
            {chapter === 'prologue' ? person.review : meta.title}
          </motion.h2>
          <motion.p className="mt-4 text-[1.1rem] text-dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <span className="mr-3 font-mono text-[0.7rem] tracking-[0.2em] uppercase" style={{ color: accent }}>
              Tip
            </span>
            {loadingTips[chapter]}
          </motion.p>

          <RouteMap chapter={chapter} accent={accent} duration={duration} />
        </div>
      </div>
    </>
  )
}

/** Star-map style route: seven stops, the rocket travels from the last chapter to this one. */
function RouteMap({ chapter, accent, duration }: { chapter: ChapterId; accent: string; duration: number }) {
  const dest = chapters.findIndex((c) => c.id === chapter)
  const from = Math.max(0, dest - 1)
  const pct = (i: number) => `${(i / (chapters.length - 1)) * 100}%`

  return (
    <div className="mt-10 flex items-end gap-8">
      <div className="relative h-10 flex-1">
        <div className="absolute inset-x-0 top-[9px] border-t border-dashed border-white/15" />
        <motion.div className="absolute top-[9px] left-0 h-px" style={{ background: accent }} initial={{ width: pct(from) }} animate={{ width: pct(dest) }} transition={{ duration: (duration / 1000) * 0.85, ease: 'easeInOut' }} />
        {chapters.map((c, i) => (
          <span key={c.id} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: pct(i) }}>
            <span className={cn('mx-auto block size-[18px] rounded-full border-2 bg-ink', i === dest && 'scale-125')} style={{ borderColor: i <= dest ? (i === dest ? accent : 'rgba(236,233,226,0.6)') : 'rgba(255,255,255,0.15)' }} />
            <span className={cn('mt-1.5 block font-mono text-[0.6rem] tracking-[0.14em]', i === dest ? 'text-paper' : 'text-faint')}>{c.goal ? pad2(c.goal) : c.id === 'prologue' ? 'P' : 'E'}</span>
          </span>
        ))}
        <motion.span className="absolute -top-6 -translate-x-1/2" style={{ color: accent }} initial={{ left: pct(from) }} animate={{ left: pct(dest) }} transition={{ duration: (duration / 1000) * 0.85, ease: 'easeInOut' }}>
          <Rocket size={18} className="rotate-45" />
        </motion.span>
      </div>
      <span className="shrink-0 pb-3 font-mono text-[0.64rem] tracking-[0.18em] text-faint uppercase">Space to skip</span>
    </div>
  )
}
