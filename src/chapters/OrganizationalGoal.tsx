import { CircleCheck, Gavel, School, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { WantedPanel } from '../components/ChapterIntro'
import { FourQuestions } from '../components/FourQuestions'
import { MetricCounter } from '../components/MetricCounter'
import { Reveal } from '../components/Reveal'
import { Kicker, SceneTitle, Stage } from '../components/Stage'
import { chapterById, organizational, quests } from '../data/selfEvaluation'
import { useSteppedValue } from '../hooks/useSteppedValue'
import { COLORS, EASE_OUT, cn, hexA, pad2 } from '../lib/utils'
import { briefingScene } from './briefingScenes'
import type { SceneDef, SceneProps } from './types'

/* 1. Zoom out: myself → the studio ---------------------------------- */

const RING_SIZES = [120, 250, 390, 540]
const CAMERA_SCALE = [2.3, 1.7, 1.25, 1]

function ZoomOutScene({ beat, mountBeat, accent }: SceneProps) {
  const rings = useSteppedValue(organizational.scopes.length, 750, mountBeat >= 1)
  const titled = beat >= 1
  const meta = chapterById('organizational')

  return (
    <Stage wide>
      <div className="relative h-full">
        <motion.div
          className="absolute top-1/2 left-1/2"
          initial={false}
          animate={{ x: titled ? '-58%' : '-50%', y: '-50%', left: titled ? '28%' : '50%', scale: titled ? 0.82 : CAMERA_SCALE[Math.max(0, rings - 1)] }}
          transition={{ duration: 1.1, ease: EASE_OUT }}
          aria-hidden={titled}
        >
          <div className="relative grid place-items-center" style={{ width: RING_SIZES[3], height: RING_SIZES[3] }}>
            {organizational.scopes.map((scope, i) => {
              const visible = i < rings
              const outermost = i === rings - 1
              return (
                <motion.div
                  key={scope}
                  className="absolute rounded-full border"
                  style={{ width: RING_SIZES[i], height: RING_SIZES[i] }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8, borderColor: outermost ? hexA(accent, 0.75) : 'rgba(255,255,255,0.12)', backgroundColor: i === 0 ? hexA(accent, 0.12) : 'rgba(0,0,0,0)' }}
                  transition={{ duration: 0.8, ease: EASE_OUT }}
                >
                  <span
                    className={cn('absolute left-1/2 -translate-x-1/2 font-mono tracking-[0.2em] whitespace-nowrap uppercase', i === 0 ? 'top-1/2 -translate-y-1/2 text-[0.62rem]' : '-top-[9px] bg-ink px-2 text-[0.62rem]')}
                    style={{ color: outermost ? accent : COLORS.dim }}
                  >
                    {scope}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <div className="absolute inset-y-0 right-0 flex w-full max-w-[640px] flex-col justify-center">
          <Reveal show={titled} delay={0.4}>
            <Kicker accent={accent}>Goal {pad2(meta.goal ?? 5)} · Priority {meta.goal}</Kicker>
          </Reveal>
          <Reveal show={titled} delay={0.5} blur>
            <h1 className="display mt-5 text-[clamp(2.8rem,4.8vw,5rem)]">{meta.title}</h1>
          </Reveal>
          <Reveal show={titled} delay={0.65}>
            <p className="mt-5 text-[1.3rem] text-dim">{meta.subtitle}</p>
          </Reveal>
          <Reveal show={titled} delay={0.8} className="mt-8">
            <WantedPanel
              accent={accent}
              wanted={['Introduce Passion Republic to students, especially from my former university', 'Share industry experience to help them prepare for their careers']}
              target={`At least ${organizational.target} sharing session this year`}
            />
          </Reveal>
        </div>

        {!titled && (
          <Reveal delay={3.2} className="absolute bottom-0 left-0">
            <p className="font-mono text-[0.66rem] tracking-[0.18em] text-faint uppercase">Zooming out</p>
          </Reveal>
        )}
      </div>
    </Stage>
  )
}

/* 2. Outreach connections -------------------------------------------- */

const ROOT = { x: 150, y: 240 }
const EVENT_Y = [80, 240, 400]
const EVENT_X = 430

function OutreachScene({ beat, accent }: SceneProps) {
  const branched = beat >= 1
  const result = beat >= 2

  return (
    <Stage wide>
      <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <SceneTitle kicker="Organizational · Outreach" title="Three stops. One studio." accent={accent} />

          <div className="relative mt-8 aspect-[780/480] w-full">
            <svg viewBox="0 0 780 480" className="absolute inset-0 size-full" aria-hidden>
              <defs>
                <pattern id="org-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.1" fill="rgba(255,255,255,0.14)" />
                </pattern>
                <radialGradient id="org-fade">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <mask id="org-mask">
                  <rect width="780" height="480" fill="url(#org-fade)" />
                </mask>
              </defs>
              <rect width="780" height="480" fill="url(#org-dots)" mask="url(#org-mask)" />
              {EVENT_Y.map((y, i) => {
                const d = `M${ROOT.x + 92} ${ROOT.y} C ${ROOT.x + 190} ${ROOT.y}, ${EVENT_X - 110} ${y}, ${EVENT_X - 6} ${y}`
                return (
                  <g key={y}>
                    <path d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
                    <motion.path d={d} fill="none" stroke={accent} strokeWidth="1.5" initial={false} animate={{ pathLength: branched ? 1 : 0 }} transition={{ duration: 0.8, delay: branched ? 0.1 + i * 0.35 : 0, ease: 'easeInOut' }} />
                  </g>
                )
              })}
            </svg>

            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(ROOT.x / 780) * 100}%`, top: `${(ROOT.y / 480) * 100}%` }}>
              <Reveal delay={0.2}>
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="grid size-16 place-items-center rounded-2xl border" style={{ borderColor: hexA(accent, 0.6), background: hexA(accent, 0.1), color: accent }}>
                    <School size={28} strokeWidth={1.5} />
                  </span>
                  <span className="font-mono text-[0.66rem] leading-relaxed tracking-[0.2em] uppercase">
                    University
                    <br />
                    outreach
                  </span>
                </div>
              </Reveal>
            </div>

            {organizational.events.map((ev, i) => (
              <div key={ev.id} className="absolute w-[42%] -translate-y-1/2" style={{ left: `${(EVENT_X / 780) * 100}%`, top: `${(EVENT_Y[i] / 480) * 100}%` }}>
                <Reveal show={branched} delay={0.6 + i * 0.35} x={16} y={0}>
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[0.6rem] tracking-[0.16em] uppercase" style={{ background: ev.role === 'Judge' ? accent : hexA(accent, 0.12), color: ev.role === 'Judge' ? COLORS.ink : accent }}>
                        {ev.role === 'Judge' ? <Gavel size={11} /> : <Users size={11} />}
                        {ev.role}
                      </span>
                      <span className="font-mono text-[0.6rem] text-faint">{pad2(i + 1)}</span>
                    </div>
                    <p className="mt-2 text-[1.08rem] leading-tight font-semibold tracking-tight">{ev.name}</p>
                    <p className="mt-1 hidden text-[0.92rem] leading-snug text-dim xl:block">{ev.note}</p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Reveal show={result} y={20}>
            <div className="glass rounded-2xl p-7">
              <TargetRow label="Target" count={organizational.target} max={3} accent={accent} dim caption="1 session" />
              <div className="my-5 h-px bg-line" />
              <TargetRow label="Result" count={organizational.events.length} max={3} accent={accent} caption="3 events" animate={result} />
              <p className="mt-6 inline-flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.18em] uppercase" style={{ color: COLORS.ok }}>
                <CircleCheck size={15} /> Objective exceeded
              </p>
            </div>
          </Reveal>
          <Reveal show={result} delay={0.25} y={20}>
            <div className="grid grid-cols-2 gap-4">
              {organizational.metrics.map((m) => (
                <div key={m.label} className="glass rounded-2xl p-5">
                  <p className="display text-[3.4rem] leading-none">
                    <MetricCounter value={m.value} start={result} duration={1} />
                  </p>
                  <p className="mt-2 font-mono text-[0.64rem] tracking-[0.16em] uppercase">{m.label}</p>
                  <p className="text-[0.9rem] text-dim">{m.context}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal show={result} delay={0.45}>
            <p className="pt-2 text-[1.1rem] leading-snug text-dim">“{organizational.why}”</p>
          </Reveal>
        </div>
      </div>
    </Stage>
  )
}

function TargetRow({ label, count, max, accent, caption, dim = false, animate = true }: { label: string; count: number; max: number; accent: string; caption: string; dim?: boolean; animate?: boolean }) {
  return (
    <div className="flex items-center gap-5">
      <span className="mono-label w-16">{label}</span>
      <span className="flex flex-1 gap-2">
        {Array.from({ length: max }, (_, i) => (
          <motion.span
            key={i}
            className="h-9 flex-1 rounded-md border"
            initial={false}
            animate={{
              backgroundColor: i < count && animate ? (dim ? 'rgba(255,255,255,0.18)' : accent) : 'rgba(255,255,255,0.02)',
              borderColor: i < count ? (dim ? 'rgba(255,255,255,0.2)' : hexA(accent, 0.7)) : 'rgba(255,255,255,0.1)',
            }}
            transition={{ duration: 0.4, delay: animate ? 0.3 + i * 0.2 : 0 }}
          />
        ))}
      </span>
      <span className={cn('w-20 text-right font-mono text-[0.8rem]', dim ? 'text-dim' : 'text-paper')}>{caption}</span>
    </div>
  )
}

function RecapScene({ beat, accent }: SceneProps) {
  return <FourQuestions data={organizational.recap} beat={beat} accent={accent} chapterTitle="Connecting students with Passion Republic" status={quests.organizational.status} allAtOnce />
}

export const organizationalScenes: SceneDef[] = [
  { id: 'og-zoom', chapter: 'organizational', title: 'Zooming out', beats: 2, Component: ZoomOutScene },
  briefingScene('organizational', 'og-briefing'),
  { id: 'og-outreach', chapter: 'organizational', title: 'Outreach', beats: 3, Component: OutreachScene },
  { id: 'og-recap', chapter: 'organizational', title: 'Recap', beats: 1, Component: RecapScene },
]
