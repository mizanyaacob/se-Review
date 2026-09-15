import { CircleCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { ChapterIntro } from '../components/ChapterIntro'
import { FourQuestions } from '../components/FourQuestions'
import { KnowledgeCard } from '../components/KnowledgeCard'
import { MetricCounter, SegmentMeter } from '../components/MetricCounter'
import { Reveal } from '../components/Reveal'
import { SceneTitle, Stage } from '../components/Stage'
import { chapterById, person, quests, retaining } from '../data/selfEvaluation'
import { useSteppedValue } from '../hooks/useSteppedValue'
import { COLORS, cn, hexA } from '../lib/utils'
import { briefingScene } from './briefingScenes'
import type { SceneDef, SceneProps } from './types'

/* 1. Intro ---------------------------------------------------------- */

function IntroScene(props: SceneProps) {
  return (
    <ChapterIntro
      {...props}
      chapterId="retaining"
      lines={['What happens after I learn something?', 'Do I actually retain it?']}
      titleLines={['Retaining', 'Experience']}
      wanted={['Retain experience by sharing it proactively', 'Be a knowledge sharer at Engineers Weekly, not just a listener']}
      target={`${retaining.target} Engineers Weekly sessions`}
    />
  )
}

/* 2. The loop ------------------------------------------------------- */

const R = 180
const C = 230

function LoopScene({ beat, mountBeat, accent }: SceneProps) {
  const reduce = useReducedMotion()
  const count = retaining.loop.length
  const lit = useSteppedValue(beat >= 1 ? count : 1, 480, mountBeat >= 1)
  const closed = lit === count
  const progress = closed ? 1 : (lit - 1) / count

  return (
    <Stage wide>
      <div className="grid items-center gap-16 lg:grid-cols-[1fr_1fr]">
        <div className="relative mx-auto aspect-square w-full max-w-[460px]">
          <svg viewBox="0 0 460 460" className="absolute inset-0 size-full overflow-visible" aria-hidden>
            <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
            <motion.circle
              cx={C}
              cy={C}
              r={R}
              fill="none"
              stroke={accent}
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(-90 ${C} ${C})`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </svg>

          {closed && !reduce && (
            <motion.div aria-hidden className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}>
              <span className="absolute left-1/2 size-2.5 -translate-x-1/2 rounded-full" style={{ top: C - R - 5, background: accent, boxShadow: `0 0 16px ${accent}` }} />
            </motion.div>
          )}

          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="mono-label">The loop</p>
              <p className="mt-2 text-[1.6rem] font-semibold tracking-tight">Retain</p>
            </div>
          </div>

          {retaining.loop.map((label, i) => {
            const angle = ((-90 + (360 / count) * i) * Math.PI) / 180
            const on = i < lit
            return (
              <motion.span
                key={label}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-2 font-mono text-[0.76rem] tracking-[0.12em] whitespace-nowrap uppercase"
                style={{ left: `${((C + R * Math.cos(angle)) / 460) * 100}%`, top: `${((C + R * Math.sin(angle)) / 460) * 100}%` }}
                initial={false}
                animate={on ? { borderColor: hexA(accent, 0.75), backgroundColor: '#15161f', color: COLORS.paper } : { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: COLORS.ink2, color: COLORS.faint }}
                transition={{ duration: 0.4 }}
              >
                {label}
              </motion.span>
            )
          })}
        </div>

        <div>
          <SceneTitle kicker="Retaining Experience · The loop" title={<>Learn. Do. Explain.<br />Understand better. Share.</>} accent={accent} size="lg" />
          <Reveal show={beat >= 2} blur className="mt-10">
            <p className="text-[clamp(1.5rem,2.3vw,2.2rem)] font-medium tracking-tight">
              Presenting forces a <span style={{ color: accent }}>deeper understanding.</span>
            </p>
          </Reveal>
          <Reveal show={beat >= 2} delay={0.3} className="mt-3">
            <p className="text-[1.15rem] text-dim">So the goal was to share, not just to listen.</p>
          </Reveal>
        </div>
      </div>
    </Stage>
  )
}

/* 3. Session cards --------------------------------------------------- */

function SessionsScene({ beat, accent }: SceneProps) {
  const fromBeat = () => retaining.sessions.map((_, i) => beat >= i + 1)
  const [revealed, setRevealed] = useState<boolean[]>(fromBeat)

  useEffect(() => {
    setRevealed(retaining.sessions.map((_, i) => beat >= i + 1))
  }, [beat])

  const sessionsDone = retaining.sessions.length

  return (
    <Stage wide>
      <SceneTitle kicker="Retaining Experience · Engineers Weekly" title="Three sessions. Three fragments of what I learned." accent={accent} />

      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {retaining.sessions.map((s, i) => (
          <Reveal as="li" key={s.id} delay={0.1 + i * 0.1} y={26}>
            <KnowledgeCard session={s} index={i} revealed={revealed[i]} accent={accent} onToggle={() => setRevealed((r) => r.map((v, j) => (j === i ? !v : v)))} />
          </Reveal>
        ))}
      </ul>

      <Reveal show={beat >= 4} className="mt-8">
        <div className="glass grid items-center gap-8 rounded-2xl px-8 py-6 lg:grid-cols-[auto_1fr_auto]">
          <div>
            <p className="mono-label">Sessions delivered</p>
            <p className="mt-1 text-[2.2rem] leading-none font-semibold tracking-tight tabular-nums">
              <MetricCounter value={sessionsDone} start={beat >= 4} duration={1} /> <span className="text-[1.1rem] font-normal text-dim">of {retaining.target} targeted</span>
            </p>
          </div>
          <SegmentMeter value={sessionsDone} target={retaining.target} max={sessionsDone} accent={accent} show={beat >= 4} />
          <span className="inline-flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.18em] uppercase" style={{ color: COLORS.ok }}>
            <CircleCheck size={15} /> Target exceeded
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mono-label mr-2">Also shared</span>
          {retaining.alsoShared.map((a) => (
            <span key={a} className="rounded-full border border-line px-3.5 py-1.5 text-[0.9rem] text-dim">
              {a}
            </span>
          ))}
        </div>
      </Reveal>
    </Stage>
  )
}

/* 4. Knowledge transfer --------------------------------------------- */

const TREE = {
  root: [360, 50],
  people: [
    [170, 190],
    [550, 190],
  ],
  from: [
    [170, 318],
    [550, 318],
  ],
  to: [
    [170, 446],
    [550, 446],
  ],
} as const

function TransferScene({ beat, accent }: SceneProps) {
  const reduce = useReducedMotion()
  const branchPaths = [
    `M360 82 V122 H170 V160`,
    `M360 82 V122 H550 V160`,
  ]

  return (
    <Stage wide>
      <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <SceneTitle kicker="Retaining Experience · Human impact" title="Knowledge transfer" accent={accent} />
          <Reveal delay={0.15}>
            <p className="mt-4 max-w-[56ch] text-[1.1rem] leading-snug text-dim">
              Alongside the migration, I helped Syarif get familiar with the Unity workflow until he could ship features confidently on his own. When Irfan joined, I helped him settle into the same workflow.
            </p>
          </Reveal>
          <div className="relative mx-auto mt-4 aspect-[720/500] w-full max-w-[620px]">
            <svg viewBox="0 0 720 500" className="absolute inset-0 size-full overflow-visible" aria-hidden>
              {retaining.people.map((_, i) => {
                const show = beat >= i + 1
                const [x] = TREE.people[i]
                const down1 = `M${x} 222 V286`
                const down2 = `M${x} 350 V414`
                return (
                  <g key={i}>
                    {[branchPaths[i], down1, down2].map((d, k) => (
                      <g key={d}>
                        <path d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
                        <motion.path d={d} fill="none" stroke={accent} strokeWidth="1.5" initial={false} animate={{ pathLength: show ? 1 : 0 }} transition={{ duration: 0.6, delay: show ? 0.15 + k * 0.45 : 0, ease: 'easeInOut' }} />
                        {show && !reduce && (
                          <circle r="3" fill={accent}>
                            <animateMotion dur="2.6s" begin={`${1.2 + k * 0.3}s`} repeatCount="indefinite" path={d} />
                          </circle>
                        )}
                      </g>
                    ))}
                  </g>
                )
              })}
            </svg>

            <TreeNode x={TREE.root[0]} y={TREE.root[1]} show>
              <span className="rounded-full px-6 py-3 font-mono text-[0.86rem] font-semibold tracking-[0.22em] text-ink uppercase" style={{ background: accent }}>
                {person.shortName}
              </span>
            </TreeNode>

            {retaining.people.map((p, i) => {
              const show = beat >= i + 1
              return (
                <div key={p.name}>
                  <TreeNode x={TREE.people[i][0]} y={TREE.people[i][1]} show={show} delay={0.5}>
                    <span className="block rounded-xl border px-6 py-2.5 text-center" style={{ borderColor: hexA(accent, 0.55), background: COLORS.ink2 }}>
                      <span className="block text-[1.25rem] font-semibold tracking-tight">{p.name}</span>
                      <span className="block font-mono text-[0.58rem] tracking-[0.18em] text-dim uppercase">{p.role}</span>
                    </span>
                  </TreeNode>
                  <TreeNode x={TREE.from[i][0]} y={TREE.from[i][1]} show={show} delay={0.95}>
                    <span className="block rounded-lg border border-line bg-ink-2 px-4 py-2 text-center text-[1rem] text-dim">{p.from}</span>
                  </TreeNode>
                  <TreeNode x={TREE.to[i][0]} y={TREE.to[i][1]} show={show} delay={1.4}>
                    <span className="block rounded-lg border px-4 py-2 text-center text-[1rem] font-medium" style={{ borderColor: hexA(COLORS.ok, 0.4), color: COLORS.paper, background: hexA(COLORS.ok, 0.06) }}>
                      {p.to}
                    </span>
                  </TreeNode>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          {retaining.metrics.map((m, i) => (
            <Reveal key={m.label} show={beat >= 3} delay={i * 0.15} x={20} y={0}>
              <div className="glass rounded-2xl p-7">
                <p className="display text-[5.2rem] leading-none" style={{ color: i === 0 ? accent : COLORS.paper }}>
                  <MetricCounter value={m.value} start={beat >= 3} duration={1.1} />
                </p>
                <p className="mt-3 font-mono text-[0.74rem] tracking-[0.2em] uppercase">{m.label}</p>
                <p className="mt-1 text-dim">{m.context}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Stage>
  )
}

function TreeNode({ x, y, show, delay = 0, children }: { x: number; y: number; show: boolean; delay?: number; children: ReactNode }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(x / 720) * 100}%`, top: `${(y / 500) * 100}%` }}>
      <Reveal show={show} delay={show ? delay : 0} y={10}>
        {children}
      </Reveal>
    </div>
  )
}

/* 5. Recap ----------------------------------------------------------- */

function RecapScene({ beat, accent }: SceneProps) {
  return <FourQuestions data={retaining.recap} beat={beat} accent={accent} chapterTitle={chapterById('retaining').title} status={quests.retaining.status} />
}

/* 6. One light becomes many ----------------------------------------- */

const BULB = { x: 450, y: 78 }
const LIGHTS = [
  { x: 110, label: 'Syarif' },
  { x: 280, label: 'Irfan' },
  { x: 450, label: 'Session 01' },
  { x: 620, label: 'Session 02' },
  { x: 790, label: 'Session 03' },
]
const LIGHT_Y = 232

function LightScene({ beat, accent }: SceneProps) {
  const branched = beat >= 1

  return (
    <Stage wide className="items-center text-center">
      <div className="relative w-full max-w-[820px]">
        <svg viewBox="0 0 900 300" className="w-full overflow-visible" role="img" aria-label="One light branching into five: Syarif, Irfan, and three Engineers Weekly sessions">
          <defs>
            <radialGradient id="bulb-glow">
              <stop offset="0%" stopColor={COLORS.paper} stopOpacity="0.9" />
              <stop offset="35%" stopColor={accent} stopOpacity="0.35" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="small-glow">
              <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
          </defs>

          {LIGHTS.map((l, i) => {
            const d = `M${BULB.x} ${BULB.y + 34} C ${BULB.x} ${BULB.y + 110}, ${l.x} ${LIGHT_Y - 100}, ${l.x} ${LIGHT_Y - 18}`
            return (
              <g key={l.label}>
                <motion.path d={d} fill="none" stroke={accent} strokeOpacity="0.6" strokeWidth="1.4" initial={false} animate={{ pathLength: branched ? 1 : 0 }} transition={{ duration: 0.9, delay: branched ? 0.2 + i * 0.12 : 0, ease: 'easeInOut' }} />
                <motion.circle cx={l.x} cy={LIGHT_Y} r="46" fill="url(#small-glow)" initial={false} animate={{ opacity: branched ? 1 : 0 }} transition={{ duration: 0.6, delay: branched ? 1 + i * 0.12 : 0 }} />
                <motion.circle
                  cx={l.x}
                  cy={LIGHT_Y}
                  r="12"
                  initial={false}
                  animate={{ fill: branched ? COLORS.paper : '#1a1b20', stroke: branched ? accent : 'rgba(255,255,255,0.15)' }}
                  transition={{ duration: 0.5, delay: branched ? 1 + i * 0.12 : 0 }}
                  strokeWidth="1.5"
                />
                <motion.text x={l.x} y={LIGHT_Y + 44} textAnchor="middle" fontSize="13" className="font-mono" letterSpacing="2" fill={COLORS.dim} initial={false} animate={{ opacity: branched ? 1 : 0 }} transition={{ delay: branched ? 1.2 + i * 0.12 : 0 }}>
                  {l.label.toUpperCase()}
                </motion.text>
              </g>
            )
          })}

          <motion.circle cx={BULB.x} cy={BULB.y} r="120" fill="url(#bulb-glow)" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.7, 0.25, 1] }} transition={{ duration: 1.4, times: [0, 0.3, 0.5, 1] }} />
          <motion.circle cx={BULB.x} cy={BULB.y} r="30" initial={{ fill: '#1a1b20' }} animate={{ fill: COLORS.paper }} transition={{ duration: 1.2, delay: 0.3 }} stroke={accent} strokeWidth="2" />
          <rect x={BULB.x - 12} y={BULB.y + 32} width="24" height="10" rx="3" fill="rgba(255,255,255,0.25)" />
        </svg>
      </div>

      <Reveal show={branched} delay={0.6} blur className="mt-8">
        <p className="display max-w-[30ch] text-[clamp(2.2rem,3.8vw,3.9rem)]">Knowledge is more valuable when it survives beyond the person who learned it.</p>
      </Reveal>
      <Reveal show={beat >= 2} delay={0.2} className="mt-7">
        <p className={cn('max-w-[48ch] text-[clamp(1.3rem,1.9vw,1.8rem)] tracking-tight text-dim')}>
          I wasn&apos;t only trying to remember what I learned. I was trying to make it <span style={{ color: accent }}>useful to someone else.</span>
        </p>
      </Reveal>
    </Stage>
  )
}

export const retainingScenes: SceneDef[] = [
  { id: 're-intro', chapter: 'retaining', title: 'Retaining Experience', beats: 4, Component: IntroScene },
  briefingScene('retaining', 're-briefing'),
  { id: 're-loop', chapter: 'retaining', title: 'The loop', beats: 3, Component: LoopScene },
  { id: 're-sessions', chapter: 'retaining', title: 'Engineers Weekly', beats: 5, Component: SessionsScene },
  { id: 're-transfer', chapter: 'retaining', title: 'Knowledge transfer', beats: 4, Component: TransferScene },
  { id: 're-recap', chapter: 'retaining', title: 'Recap', beats: 4, Component: RecapScene },
  { id: 're-light', chapter: 'retaining', title: 'One light becomes many', beats: 3, Component: LightScene },
]
