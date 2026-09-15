import { Circle, CircleCheck, CircleDashed, LoaderCircle, RefreshCw } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { SceneProps } from '../chapters/types'
import { departmental } from '../data/selfEvaluation'
import { useSteppedValue } from '../hooks/useSteppedValue'
import { COLORS, EASE_OUT, cn, hexA } from '../lib/utils'
import { Reveal } from './Reveal'
import { SceneTitle, Stage } from './Stage'
import { StatusDot } from './StatusDot'

type StepState = 'idle' | 'running' | 'pass' | 'pending' | 'stale'

const UNREAL_STEPS = ['Trigger', 'Build agent', 'Build', 'Remaining setup']
const UNITY_STEPS = ['Trigger', 'Build agent', 'Build', 'Automated build']

/** Where the build panel settles for each beat. */
const FINAL: StepState[][] = [
  ['idle', 'idle', 'idle', 'idle'],
  ['pass', 'pass', 'pass', 'pending'],
  ['stale', 'stale', 'stale', 'stale'],
  ['pass', 'pass', 'pass', 'pass'],
]
/** How many timeline stops are lit at each beat. */
const TIMELINE_LIT = [3, 4, 5, 7]

const STATUS = [
  { text: 'No pipeline yet', color: COLORS.faint },
  { text: 'Build pipeline working on Unreal · setup not finished', color: COLORS.warn },
  { text: 'Project migrated to Unity · pipeline needs rebuilding', color: COLORS.warn },
  { text: 'Build successful · the automated build still works today', color: COLORS.ok },
]

/**
 * Departmental goal: the BKT pipeline story as an interactive build.
 * Beat 0 zero → TeamCity, beat 1 Unreal build, beat 2 migration, beat 3 rebuilt for Unity.
 */
export function DevOpsPipeline({ beat, mountBeat, accent }: SceneProps) {
  const reduce = useReducedMotion()
  const lit = useSteppedValue(TIMELINE_LIT[beat], 320, mountBeat > 0)
  const [steps, setSteps] = useState<StepState[]>(FINAL[beat])
  const engine = beat >= 2 ? 'Unity' : 'Unreal'
  const labels = beat >= 2 ? UNITY_STEPS : UNREAL_STEPS

  useEffect(() => {
    const final = FINAL[beat]
    const runs = beat === 1 || beat === 3
    if (beat === mountBeat || reduce || !runs) {
      setSteps(final)
      return
    }
    setSteps(['idle', 'idle', 'idle', 'idle'])
    const timers: number[] = []
    final.forEach((state, i) => {
      const start = 450 + i * 720
      timers.push(window.setTimeout(() => setSteps((s) => s.map((v, j) => (j === i ? 'running' : v))), start))
      timers.push(window.setTimeout(() => setSteps((s) => s.map((v, j) => (j === i ? state : v))), start + 560))
    })
    return () => timers.forEach(window.clearTimeout)
  }, [beat, mountBeat, reduce])

  const settled = steps.every((s, i) => s === FINAL[beat][i])
  const status = STATUS[beat]
  const latest = departmental.timeline[Math.max(0, lit - 1)]

  return (
    <Stage wide>
      <SceneTitle kicker="Departmental · The BKT pipeline" title="From zero to an automated build" accent={accent} />

      {/* timeline */}
      <Reveal delay={0.15} className="mt-10">
        <ol className="grid grid-cols-7 gap-2">
          {departmental.timeline.map((stop, i) => {
            const on = i < lit
            return (
              <li key={stop.label} className="relative">
                <div className={cn('relative h-px bg-white/10', i === departmental.timeline.length - 1 ? 'w-3' : 'w-full')}>
                  <motion.span className="absolute inset-0 origin-left" style={{ background: accent }} initial={false} animate={{ scaleX: i < lit - 1 ? 1 : 0 }} transition={{ duration: 0.4 }} />
                </div>
                <motion.span
                  className="absolute -top-[5px] left-0 size-[11px] rounded-full border-2"
                  initial={false}
                  animate={{ borderColor: on ? accent : 'rgba(255,255,255,0.18)', backgroundColor: on ? accent : COLORS.ink }}
                />
                <p className={cn('mt-5 pr-2 font-mono text-[0.68rem] leading-snug tracking-[0.12em] uppercase transition-colors duration-500', on ? 'text-paper' : 'text-faint')}>{stop.label}</p>
              </li>
            )
          })}
        </ol>
        <div className="mt-4 h-8">
          <AnimatePresence mode="wait">
            <motion.p key={latest.label} className="text-[1.15rem] text-dim" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
              <span className="font-mono text-[0.7rem] tracking-[0.14em] uppercase" style={{ color: accent }}>
                {latest.label}
              </span>
              <span className="mx-3 text-faint">—</span>
              {latest.note}
            </motion.p>
          </AnimatePresence>
        </div>
      </Reveal>

      {/* build panel */}
      <Reveal delay={0.25} className="mt-8">
        <section className="glass rounded-2xl p-7" aria-label="Build configuration">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
            <div className="flex items-center gap-4">
              <span className="mono-label">Build configuration</span>
              <span className="text-xl font-semibold tracking-tight">BKT</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={engine}
                  className="rounded-md border px-2.5 py-1 font-mono text-[0.68rem] tracking-[0.16em] uppercase"
                  style={{ borderColor: hexA(accent, 0.5), color: accent }}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4 }}
                >
                  {engine}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="font-mono text-[0.7rem] tracking-[0.16em] text-dim uppercase">TeamCity</span>
          </header>

          <ol className="mt-6 grid grid-cols-4 gap-4">
            {steps.map((state, i) => (
              <li key={i} className="relative">
                <StepCard label={labels[i]} state={state} accent={accent} />
                {i < 3 && <span aria-hidden className="absolute top-1/2 -right-4 h-px w-4 bg-white/10" />}
              </li>
            ))}
          </ol>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <AnimatePresence mode="wait">
              <motion.div key={settled ? `${beat}-settled` : `${beat}-running`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {settled ? <StatusDot label={status.text} color={status.color} pulse={beat === 3} /> : <StatusDot label="Running…" color={COLORS.paper} pulse />}
              </motion.div>
            </AnimatePresence>
            <span className="font-mono text-[0.6rem] tracking-[0.14em] text-faint uppercase">Steps simplified for the story</span>
          </footer>
        </section>
      </Reveal>
    </Stage>
  )
}

function StepCard({ label, state, accent }: { label: string; state: StepState; accent: string }) {
  const look = {
    idle: { Icon: Circle, color: COLORS.faint, text: 'Idle' },
    running: { Icon: LoaderCircle, color: COLORS.paper, text: 'Running' },
    pass: { Icon: CircleCheck, color: COLORS.ok, text: 'Passed' },
    pending: { Icon: CircleDashed, color: COLORS.warn, text: 'Not finished' },
    stale: { Icon: RefreshCw, color: COLORS.faint, text: 'Needs rebuild' },
  }[state]
  const Icon = look.Icon

  return (
    <motion.div
      className="flex items-center gap-3 rounded-xl border px-4 py-4"
      initial={false}
      animate={{
        borderColor: state === 'pass' ? hexA(COLORS.ok, 0.35) : state === 'running' ? hexA(accent, 0.6) : 'rgba(255,255,255,0.08)',
        backgroundColor: state === 'running' ? hexA(accent, 0.08) : 'rgba(255,255,255,0.015)',
        opacity: state === 'stale' ? 0.55 : 1,
      }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
    >
      <Icon size={20} strokeWidth={1.8} style={{ color: look.color }} className={state === 'running' ? 'animate-spin' : undefined} />
      <div className="min-w-0">
        <p className="truncate text-[1rem] font-medium">{label}</p>
        <p className="font-mono text-[0.62rem] tracking-[0.14em] uppercase" style={{ color: look.color }}>
          {look.text}
        </p>
      </div>
    </motion.div>
  )
}
