import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { useLayoutEffect, useRef } from 'react'
import { FinalReveal } from '../components/FinalReveal'
import { PixelHero } from '../components/game/PixelHero'
import { Reveal } from '../components/Reveal'
import { Kicker, Stage } from '../components/Stage'
import { chapterById, credits, epilogue, person, type ChapterId } from '../data/selfEvaluation'
import { useSteppedValue } from '../hooks/useSteppedValue'
import { COLORS, EASE_OUT, cn, hexA, mixHex } from '../lib/utils'
import type { SceneDef, SceneProps } from './types'

/* 1. The five goals come together ------------------------------------ */

interface StarNode {
  id: ChapterId
  x: number
  y: number
  size: number
  label: string
  note: string
}

// Working Knowledge at the centre; personal growth sits alongside, not beneath.
const STARS: StarNode[] = [
  { id: 'working', x: 500, y: 300, size: 230, label: 'Working Knowledge', note: 'Primary' },
  { id: 'retaining', x: 500, y: 560, size: 124, label: 'Retaining Experience', note: 'Team' },
  { id: 'departmental', x: 850, y: 300, size: 124, label: 'Departmental', note: 'Department' },
  { id: 'organizational', x: 500, y: 48, size: 124, label: 'Organizational', note: 'Studio' },
  { id: 'personal', x: 150, y: 300, size: 124, label: 'Personal', note: 'Alongside' },
]

/** Which chain step (1-based, see epilogue.chain) lights each node and the edge leading to it. */
const NODE_STEP: Partial<Record<ChapterId, number>> = { working: 1, retaining: 2, departmental: 4, organizational: 5 }

const EDGES: Array<{ to: ChapterId; dashed?: boolean }> = [{ to: 'retaining' }, { to: 'departmental' }, { to: 'organizational' }, { to: 'personal', dashed: true }]

function ConstellationScene({ beat, mountBeat }: SceneProps) {
  const chainLit = useSteppedValue(beat >= 1 ? epilogue.chain.length : 0, 650, mountBeat >= 1)
  const center = STARS[0]
  const amber = chapterById('working').accent

  return (
    <Stage wide>
      <div className="grid items-center gap-10 lg:grid-cols-[1.45fr_0.55fr]">
        <div className="@container relative mx-auto aspect-[1000/610] w-full">
          <svg viewBox="0 0 1000 610" className="absolute inset-0 size-full overflow-visible" aria-hidden>
            {EDGES.map((edge) => {
              const target = STARS.find((s) => s.id === edge.to)!
              const on = chainLit >= (NODE_STEP[edge.to] ?? 0)
              return (
                <g key={edge.to}>
                  <line x1={center.x} y1={center.y} x2={target.x} y2={target.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray={edge.dashed ? '5 7' : undefined} />
                  {!edge.dashed && (
                    <motion.line
                      x1={center.x}
                      y1={center.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={chapterById(edge.to).accent}
                      strokeWidth="2"
                      initial={false}
                      animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
                      transition={{ duration: 0.7, ease: 'easeInOut' }}
                    />
                  )}
                </g>
              )
            })}
          </svg>

          {STARS.map((s, i) => {
            const meta = chapterById(s.id)
            const primary = s.id === 'working'
            const lit = s.id === 'personal' || chainLit >= (NODE_STEP[s.id] ?? 0)
            return (
              <motion.div
                key={s.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(s.x / 1000) * 100}%`, top: `${(s.y / 610) * 100}%` }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: primary ? 0.1 : 0.35 + i * 0.12, ease: EASE_OUT }}
              >
                <motion.div
                  className={cn('relative grid place-items-center rounded-full border text-center', primary ? 'p-6' : 'p-3')}
                  // sized against the diagram's own width so nodes never collide at smaller screens
                  style={{ width: `max(${primary ? 150 : 92}px, ${s.size / 10}cqw)`, height: `max(${primary ? 150 : 92}px, ${s.size / 10}cqw)` }}
                  initial={false}
                  animate={{
                    borderColor: lit ? hexA(meta.accent, primary ? 0.9 : 0.7) : 'rgba(255,255,255,0.12)',
                    // opaque fills so the connecting lines stop at each node's edge
                    backgroundColor: mixHex(meta.accent, COLORS.ink2, primary ? (lit ? 0.16 : 0.06) : lit ? 0.09 : 0),
                    boxShadow: primary && lit ? `0 0 80px -10px ${hexA(meta.accent, 0.5)}` : '0 0 0 rgba(0,0,0,0)',
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <span>
                    <span className={cn('block leading-tight font-semibold tracking-tight', primary ? 'text-[clamp(1.05rem,2.6cqw,1.7rem)]' : 'text-[clamp(0.66rem,1.25cqw,0.92rem)]')}>{s.label}</span>
                    <span className="mt-1 block font-mono text-[0.56rem] tracking-[0.16em] uppercase" style={{ color: meta.accent }}>
                      {s.note}
                    </span>
                  </span>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        <div>
          <Reveal>
            <Kicker>Epilogue · How it connects</Kicker>
          </Reveal>
          <ol className="mt-6 space-y-2">
            {epilogue.chain.map((step, i) => {
              const on = i < chainLit
              return (
                <li key={step} className="flex items-center gap-4">
                  <motion.span className="size-2 shrink-0 rounded-full" initial={false} animate={{ backgroundColor: on ? amber : 'rgba(255,255,255,0.15)' }} />
                  <motion.span className="text-[1.15rem] font-medium tracking-tight" initial={false} animate={{ color: on ? COLORS.paper : COLORS.faint }} transition={{ duration: 0.4 }}>
                    {step}
                  </motion.span>
                </li>
              )
            })}
          </ol>
          <div className="mt-10 space-y-2">
            {epilogue.thesis.map((line, i) => (
              <Reveal key={line} show={beat >= 2} delay={0.2 + i * 0.45} blur>
                <p className={cn('text-[clamp(1.35rem,2vw,1.9rem)] leading-tight font-semibold tracking-tight', i === 2 ? 'text-paper' : 'text-dim')}>{line}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Stage>
  )
}

/* 3. End screen --------------------------------------------------------- */

function EndScene({ beat }: SceneProps) {
  const amber = chapterById('working').accent

  return (
    <Stage wide>
      <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Reveal>
            <p className="text-[clamp(4rem,9vw,9rem)] leading-none font-semibold tracking-tighter text-transparent" style={{ WebkitTextStroke: `1px ${hexA(COLORS.paper, 0.35)}` }}>
              2026
            </p>
          </Reveal>
          <ul className="mt-8 space-y-1">
            {epilogue.verbs.map((verb, i) => (
              <Reveal as="li" key={verb} delay={0.35 + i * 0.16} x={-24} y={0}>
                <span className="display block text-[clamp(2.4rem,4.6vw,4.6rem)]" style={{ color: i === epilogue.verbs.length - 1 ? amber : undefined }}>
                  {verb}
                </span>
              </Reveal>
            ))}
          </ul>
        </div>

        <div>
          <Reveal show={beat >= 1} blur>
            <p className="display text-[clamp(2.2rem,3.8vw,3.9rem)] text-dim">{epilogue.nextA}</p>
          </Reveal>
          <Reveal show={beat >= 2} delay={0.2} blur className="mt-6">
            <p className="display text-[clamp(2.6rem,4.6vw,4.8rem)]">{epilogue.nextB}</p>
          </Reveal>
          <Reveal show={beat >= 3} delay={0.2} className="mt-16">
            <p className="display text-[clamp(3.4rem,6vw,6rem)]" style={{ color: amber }}>
              Thank you.
            </p>
            <p className="mt-6 font-mono text-[0.72rem] tracking-[0.22em] text-dim uppercase">
              {person.name} · {person.role} · {person.studio}
            </p>
          </Reveal>
        </div>
      </div>
    </Stage>
  )
}

/* 4. Credits roll -------------------------------------------------------- */

function CreditsScene({ accent }: SceneProps) {
  const reduce = useReducedMotion()
  const contentRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)
  const amber = chapterById('working').accent

  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el || reduce) return
    const start = window.innerHeight * 0.78
    const end = -(el.offsetHeight - window.innerHeight * 0.62)
    y.set(start)
    const controls = animate(y, end, { duration: (start - end) / 62, ease: 'linear', delay: 0.6 })
    return () => controls.stop()
  }, [reduce, y])

  return (
    <div
      className={cn('relative h-full', reduce ? 'overflow-y-auto pt-24' : 'overflow-hidden')}
      // fade the roll in and out at the edges so it never slides under the HUD
      style={{ maskImage: 'linear-gradient(to bottom, transparent 0, transparent 8%, black 24%, black 80%, transparent 92%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, transparent 8%, black 24%, black 80%, transparent 92%)' }}
    >
      <motion.div ref={contentRef} className="mx-auto flex max-w-3xl flex-col items-center px-8 pb-10 text-center" style={{ y }}>
        <p className="font-pixel text-[16px] tracking-[4px] uppercase" style={{ color: amber }}>
          Credits
        </p>
        <h2 className="display mt-6 text-[clamp(3rem,6vw,6rem)]">{person.review}</h2>
        <p className="mt-4 text-[1.2rem] text-dim">A story in five quests · played by {person.name}, {person.role}</p>

        <dl className="mt-24 w-full space-y-12">
          {credits.map((c) => (
            <div key={c.role}>
              <dt className="font-mono text-[0.76rem] tracking-[0.22em] text-faint uppercase">{c.role}</dt>
              <dd className="mt-2 text-[clamp(1.5rem,2.4vw,2.2rem)] font-semibold tracking-tight">{c.name}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-32 flex flex-col items-center gap-6">
          <PixelHero accent={accent === '#E9E6DF' ? amber : accent} walking scale={4} />
          <p className="font-pixel text-[32px] tracking-[2px] uppercase" style={{ color: amber }}>
            Thanks for playing
          </p>
          <p className="font-mono text-[0.7rem] tracking-[0.2em] text-faint uppercase">Esc · back to overview</p>
        </div>
      </motion.div>
    </div>
  )
}

export const epilogueScenes: SceneDef[] = [
  { id: 'ep-constellation', chapter: 'epilogue', title: 'The five goals together', beats: 3, Component: ConstellationScene },
  { id: 'ep-reveal', chapter: 'epilogue', title: 'Final reveal', beats: epilogue.reveal.length + 2, Component: FinalReveal },
  { id: 'ep-end', chapter: 'epilogue', title: 'Thank you', beats: 4, Component: EndScene },
  { id: 'ep-credits', chapter: 'epilogue', title: 'Credits', beats: 1, Component: CreditsScene },
]
