import { ArrowRight, BookOpen, CircleCheck, GraduationCap, Trophy, Users, Wrench } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { CertificateCarousel } from '../components/CertificateCarousel'
import { ChapterIntro } from '../components/ChapterIntro'
import { FourQuestions } from '../components/FourQuestions'
import { MetricCounter } from '../components/MetricCounter'
import { Reveal } from '../components/Reveal'
import { Kicker, SceneTitle, Stage } from '../components/Stage'
import { Timeline } from '../components/Timeline'
import { ToolTile, ToolUnlockedCard, toolIcons } from '../components/ToolCard'
import { chapterById, quests, working } from '../data/selfEvaluation'
import { useSteppedValue } from '../hooks/useSteppedValue'
import { COLORS, EASE_OUT, cn, hexA, mixHex, pad2 } from '../lib/utils'
import { briefingScene } from './briefingScenes'
import type { SceneDef, SceneProps } from './types'

/* ------------------------------------------------------------------ */
/* 1. Intro                                                            */
/* ------------------------------------------------------------------ */

function IntroScene(props: SceneProps) {
  return <ChapterIntro {...props} chapterId="working" major titleLines={['Working', 'Knowledge']} wanted={working.wantedShort} />
}

/* ------------------------------------------------------------------ */
/* 2. The learning loop                                                */
/* ------------------------------------------------------------------ */

// Snake layout: row one left→right, U-turn, row two right→left.
const LOOP_POINTS: Array<[number, number]> = [
  [125, 75], [375, 75], [625, 75], [875, 75],
  [875, 225], [625, 225], [375, 225], [125, 225],
]
const LOOP_PATH = 'M125 75 H875 C 965 75 965 225 875 225 H125'
const LOOP_LENGTH = 1750 // 750 + ~250 (U-turn) + 750
const LOOP_AT = [0, 250, 500, 750, 1000, 1250, 1500, 1750]

function LearningLoopScene({ beat, mountBeat, accent }: SceneProps) {
  const lit = useSteppedValue(beat >= 1 ? 8 : 0, 340, mountBeat >= 1)
  const drawn = lit <= 1 ? 0 : LOOP_AT[lit - 1] / LOOP_LENGTH

  return (
    <Stage wide>
      <SceneTitle kicker="Working Knowledge · How the learning actually happened" title="Not a list of courses. A loop." accent={accent} />

      <div className="relative mt-12 aspect-[1000/300] w-full">
        <svg viewBox="0 0 1000 300" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <path d={LOOP_PATH} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="4 8" />
          <motion.path d={LOOP_PATH} fill="none" stroke={accent} strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: drawn }} transition={{ duration: 0.34, ease: 'linear' }} />
        </svg>
        <ol>
          {working.learningLoop.map((label, i) => {
            const [x, y] = LOOP_POINTS[i]
            const on = i < lit
            const last = i === working.learningLoop.length - 1
            return (
              <li key={label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x / 10}%`, top: `${y / 3}%` }}>
                <motion.div
                  className="relative flex min-w-[168px] flex-col items-center gap-1.5 rounded-xl border px-5 py-3.5 text-center"
                  initial={false}
                  animate={
                    on
                      ? { borderColor: hexA(accent, 0.7), backgroundColor: last ? accent : '#17140f', scale: last ? 1.06 : 1 }
                      : { borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#101013', scale: 1 }
                  }
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                >
                  <span className="font-mono text-[0.62rem] tracking-[0.2em]" style={{ color: on ? (last ? COLORS.ink : accent) : COLORS.faint }}>
                    {pad2(i + 1)}
                  </span>
                  <span className={cn('text-[1.02rem] font-medium tracking-tight whitespace-nowrap', on ? (last ? 'text-ink' : 'text-paper') : 'text-faint')}>{label}</span>
                  {i === lit - 1 && !last && (
                    <motion.span aria-hidden className="absolute inset-0 rounded-xl" style={{ boxShadow: `0 0 0 1px ${accent}` }} animate={{ opacity: [0.8, 0], scale: [1, 1.12] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  )}
                </motion.div>
              </li>
            )
          })}
        </ol>
      </div>

      <Reveal show={beat >= 2} className="mt-12" blur>
        <p className="text-[clamp(1.6rem,2.5vw,2.4rem)] font-medium tracking-tight">
          It started with questions. It ended with <span style={{ color: accent }}>tools the team could reuse.</span>
        </p>
      </Reveal>
    </Stage>
  )
}

/* ------------------------------------------------------------------ */
/* 3. The challenge: engine migration as a state machine               */
/* ------------------------------------------------------------------ */

function MigrationChallengeScene({ beat, accent }: SceneProps) {
  const states = working.migrationStates
  const idx = Math.min(beat, states.length - 1)
  const current = states[idx]
  const done = idx === states.length - 1

  return (
    <Stage wide>
      <div className="grid items-center gap-16 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <Reveal>
            <Kicker accent={accent}>Challenge</Kicker>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display mt-3 text-[clamp(2.2rem,3.4vw,3.4rem)] text-dim">Engine migration</h2>
          </Reveal>

          {/* the one "boss bar" in the story: it drains as each state is overcome */}
          <Reveal delay={0.12} className="mt-7 max-w-[600px]">
            <div className="font-pixel flex items-center justify-between text-[16px] tracking-[2px] uppercase">
              <span style={{ color: done ? COLORS.ok : COLORS.alert }}>{done ? 'Challenge cleared' : 'Challenge HP'}</span>
              <span className="text-faint">
                Stage {idx + 1} / {states.length}
              </span>
            </div>
            <motion.div
              key={`hp-${idx}`}
              className="mt-2 flex gap-[3px] rounded-[3px] border border-white/15 bg-black/40 p-[3px]"
              animate={idx > 0 ? { x: [0, -7, 6, -3, 2, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {Array.from({ length: 20 }, (_, i) => {
                const alive = i < Math.round(20 * (1 - idx / (states.length - 1)))
                return (
                  <motion.span
                    key={i}
                    className="h-3.5 flex-1 rounded-[1px]"
                    initial={false}
                    animate={{ backgroundColor: alive ? (idx >= 3 ? COLORS.warn : COLORS.alert) : 'rgba(255,255,255,0.05)' }}
                    transition={{ duration: 0.2, delay: alive ? 0 : (19 - i) * 0.012 }}
                  />
                )
              })}
            </motion.div>
          </Reveal>

          <div className="relative mt-8 h-[clamp(5rem,8.5vw,9rem)]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.p
                key={current.state}
                className="display absolute inset-0 text-[clamp(4.4rem,8vw,8.6rem)] uppercase"
                style={{ color: done ? COLORS.ok : COLORS.paper }}
                initial={{ opacity: 0, y: 44, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -44, filter: 'blur(12px)' }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
              >
                {current.state}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-8 min-h-[4.5rem]">
            <AnimatePresence mode="wait">
              <motion.p key={current.note} className="max-w-[42ch] text-[clamp(1.3rem,1.9vw,1.8rem)] text-dim" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, delay: 0.1 }}>
                {current.note}
              </motion.p>
            </AnimatePresence>
          </div>

          <Reveal show={done} delay={0.5} className="mt-6">
            <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[0.7rem] tracking-[0.18em] uppercase" style={{ borderColor: hexA(COLORS.ok, 0.4), color: COLORS.ok }}>
              <CircleCheck size={14} /> Migration complete · with Syarif
            </span>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={24}>
          <div className="glass relative rounded-2xl p-8">
            <p className="mono-label">State</p>
            <ol className="relative mt-6">
              <span aria-hidden className="absolute top-3 bottom-3 left-[5px] w-px bg-white/10" />
              <motion.span
                aria-hidden
                className="absolute top-3 left-[5px] w-px origin-top"
                style={{ background: done ? COLORS.ok : accent, height: 'calc(100% - 24px)' }}
                initial={false}
                animate={{ scaleY: idx / (states.length - 1) }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              />
              {states.map((s, i) => {
                const reached = i <= idx
                const isCurrent = i === idx
                return (
                  <li key={s.state} className="relative flex items-center gap-5 py-3">
                    <motion.span
                      className="relative z-10 size-[11px] rounded-full border-2"
                      initial={false}
                      animate={{ borderColor: reached ? (done ? COLORS.ok : accent) : 'rgba(255,255,255,0.2)', backgroundColor: isCurrent ? (done ? COLORS.ok : accent) : COLORS.ink2 }}
                    />
                    <span className={cn('font-mono text-[0.86rem] tracking-[0.16em] uppercase transition-colors duration-500', isCurrent ? 'text-paper' : reached ? 'text-dim' : 'text-faint')}>{s.state}</span>
                  </li>
                )
              })}
            </ol>
          </div>
        </Reveal>
      </div>
    </Stage>
  )
}

/* ------------------------------------------------------------------ */
/* 4. Engineering Growth Map                                           */
/* ------------------------------------------------------------------ */

type NodeId = 'courses' | 'migration' | 'tools'
const BEAT_NODE: Array<NodeId | null> = [null, 'courses', 'migration', 'tools']

function GrowthMapScene({ beat, mountBeat, accent, goToScene }: SceneProps) {
  const [open, setOpen] = useState<NodeId | null>(BEAT_NODE[beat])
  const [tool, setTool] = useState(working.tools.length - 1)

  // The presenter's Space press drives which node is open; clicks can override it.
  useEffect(() => {
    setOpen(BEAT_NODE[beat])
  }, [beat])

  const nodes: Array<{ id: NodeId; value: string; label: string; icon: typeof BookOpen }> = [
    { id: 'courses', value: String(working.courses.count), label: 'Udemy courses', icon: GraduationCap },
    { id: 'migration', value: 'Unreal → Unity', label: 'Engine migration', icon: ArrowRight },
    { id: 'tools', value: String(working.tools.length), label: 'Internal tools built', icon: Wrench },
  ]

  return (
    <Stage wide>
      <div className="flex items-end justify-between gap-6">
        <SceneTitle kicker="Working Knowledge · Explore" title="Engineering growth map" accent={accent} />
        <Reveal delay={0.3}>
          <p className="font-mono text-[0.66rem] tracking-[0.16em] text-faint uppercase">Click a node to explore</p>
        </Reveal>
      </div>

      <Reveal delay={0.12} className="mt-9">
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch">
          {nodes.map((n, i) => {
            const selected = open === n.id
            const Icon = n.icon
            return (
              <div key={n.id} className="contents">
                <motion.button
                  type="button"
                  onClick={() => setOpen(selected ? null : n.id)}
                  aria-expanded={selected}
                  whileHover={{ y: -3 }}
                  className="relative flex flex-col items-start gap-3 rounded-2xl border p-6 text-left transition-colors duration-300"
                  style={{ borderColor: selected ? hexA(accent, 0.6) : COLORS.line, background: selected ? hexA(accent, 0.08) : 'rgba(255,255,255,0.02)' }}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="font-mono text-[0.62rem] tracking-[0.2em] text-faint uppercase">Node {pad2(i + 1)}</span>
                    {n.id !== 'migration' && <Icon size={18} strokeWidth={1.6} style={{ color: selected ? accent : COLORS.faint }} />}
                  </span>
                  <span className="text-[clamp(2rem,3vw,2.8rem)] leading-none font-semibold tracking-tight tabular-nums">{n.value}</span>
                  <span className="mono-label" style={selected ? { color: accent } : undefined}>
                    {n.label}
                  </span>
                </motion.button>
                {i < nodes.length - 1 && (
                  <span aria-hidden className="flex w-10 items-center">
                    <span className="h-px w-full" style={{ background: `linear-gradient(90deg, ${COLORS.line2}, ${hexA(accent, 0.5)})` }} />
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </Reveal>

      <div className="relative mt-5 min-h-[330px]">
        <AnimatePresence mode="wait">
          <motion.div key={open ?? 'none'} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: EASE_OUT }}>
            {open === null && (
              <div className="grid min-h-[330px] place-items-center rounded-2xl border border-dashed border-line">
                <p className="text-[1.2rem] text-faint">Three nodes. One year of learning, rebuilding and building.</p>
              </div>
            )}

            {open === 'courses' && (
              <div className="glass grid min-h-[330px] gap-10 rounded-2xl p-8 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="mono-label" style={{ color: accent }}>
                    Courses
                  </p>
                  <p className="display mt-4 text-[6rem]">
                    <MetricCounter value={working.courses.count} duration={1} />
                  </p>
                  <p className="mt-2 max-w-[34ch] text-[1.1rem] text-dim">{working.courses.detail}</p>
                  <button
                    type="button"
                    onClick={() => goToScene('wk-certificates')}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[0.7rem] tracking-[0.16em] uppercase transition-colors hover:bg-white/5"
                    style={{ borderColor: hexA(accent, 0.45), color: accent }}
                  >
                    View certificates <ArrowRight size={14} />
                  </button>
                </div>
                <ul className="grid content-center gap-3 sm:grid-cols-2">
                  {working.learning.map((item, i) => (
                    <Reveal as="li" key={item} delay={0.15 + i * 0.08} className="rounded-xl border border-line bg-white/[0.02] p-5 text-[1.05rem] leading-snug">
                      <span className="mb-3 block font-mono text-[0.62rem] tracking-[0.2em]" style={{ color: accent }}>
                        {pad2(i + 1)}
                      </span>
                      {item}
                    </Reveal>
                  ))}
                </ul>
              </div>
            )}

            {open === 'migration' && <MigrationPanel accent={accent} instant={mountBeat >= 2} />}

            {open === 'tools' && (
              <div className="glass grid min-h-[330px] gap-6 rounded-2xl p-6 lg:grid-cols-[1.25fr_0.75fr]">
                <div>
                  <p className="mono-label" style={{ color: accent }}>
                    {working.tools.length} tools unlocked
                  </p>
                  <div className="mt-4 grid grid-cols-4 gap-2.5 xl:grid-cols-7">
                    {working.tools.map((t, i) => (
                      <Reveal key={t.id} delay={0.05 + i * 0.05} y={10}>
                        <ToolTile tool={t} index={i} selected={tool === i} accent={accent} onSelect={() => setTool(i)} className="h-full w-full" />
                      </Reveal>
                    ))}
                  </div>
                  <p className="mt-5 hidden text-[1.02rem] text-dim xl:block">{working.toolOrigin}</p>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={tool} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3 }}>
                    <ToolUnlockedCard tool={working.tools[tool]} index={tool} accent={accent} onExplore={() => goToScene('wk-toolbelt')} />
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Stage>
  )
}

function MigrationPanel({ accent, instant }: { accent: string; instant: boolean }) {
  const lit = useSteppedValue(working.migrationFlow.length, 380, instant)
  return (
    <div className="glass flex min-h-[330px] flex-col justify-center gap-10 rounded-2xl p-8">
      <p className="mono-label" style={{ color: accent }}>
        Migration story
      </p>
      <Timeline items={working.migrationFlow} lit={lit} accent={accent} size="md" />
      <p className="flex items-center gap-3 text-[1.25rem]">
        <Users size={20} style={{ color: accent }} />
        {working.migrationNote}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 5. The toolbelt                                                     */
/* ------------------------------------------------------------------ */

function ToolbeltScene({ beat, mountBeat, accent }: SceneProps) {
  const unlocked = useSteppedValue(beat >= 1 ? working.tools.length : 0, 200, mountBeat >= 1)
  const [hovered, setHovered] = useState<number | null>(null)
  const allUnlocked = unlocked === working.tools.length
  const featured = hovered ?? (allUnlocked ? working.tools.length - 1 : null)

  return (
    <Stage wide>
      <div className="flex items-end justify-between gap-6">
        <SceneTitle kicker="Working Knowledge · The toolbelt" title="From learning things to building things" accent={accent} />
        <span className="pb-2 font-mono text-[0.7rem] tracking-[0.18em] text-dim tabular-nums">
          {unlocked} / {working.tools.length} UNLOCKED
        </span>
      </div>

      {/* belt */}
      <Reveal delay={0.12} className="mt-10">
        <div className="relative rounded-[28px] border border-line bg-gradient-to-b from-white/[0.035] to-white/[0.01] p-5">
          <span aria-hidden className="absolute inset-x-6 top-1/2 h-16 -translate-y-1/2 border-y border-dashed border-white/[0.07]" />
          <ul className="relative grid grid-cols-7 gap-4">
            {working.tools.map((t, i) => {
              const Icon = toolIcons[t.id]
              const isUnlocked = i < unlocked
              const active = featured === i
              return (
                <li key={t.id} className="relative aspect-square rounded-2xl border border-dashed border-white/10 bg-ink/70">
                  <AnimatePresence>
                    {isUnlocked && (
                      <motion.button
                        type="button"
                        className="group absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border bg-ink-3 px-2 text-center"
                        style={{ borderColor: active ? hexA(accent, 0.7) : COLORS.line2 }}
                        initial={{ opacity: 0, y: -40, scale: 0.85 }}
                        animate={{ opacity: 1, y: active ? -6 : 0, scale: 1, boxShadow: active ? `0 18px 50px -12px ${hexA(accent, 0.45)}` : '0 0 0 rgba(0,0,0,0)' }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(i)}
                        onBlur={() => setHovered(null)}
                        aria-describedby="toolbelt-detail"
                      >
                        {/* hotbar slot number + pickup flash */}
                        <span className="font-pixel absolute top-2 left-3 text-[16px] leading-none" style={{ color: active ? accent : COLORS.faint }}>
                          {i + 1}
                        </span>
                        <motion.span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-2xl border-2"
                          style={{ borderColor: accent }}
                          initial={{ opacity: 0.9, scale: 0.85 }}
                          animate={{ opacity: 0, scale: 1.25 }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                        />
                        <Icon size={34} strokeWidth={1.4} style={{ color: active ? accent : COLORS.paper }} className="transition-colors" />
                        <span className="text-[0.82rem] leading-tight text-dim">{t.name}</span>
                        <AnimatePresence>
                          {hovered === i && (
                            <motion.span
                              role="tooltip"
                              className="absolute bottom-[calc(100%+12px)] left-1/2 z-10 w-max max-w-[240px] -translate-x-1/2 rounded-lg border border-line-2 bg-ink-3 px-3 py-2 text-left"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <span className="block text-[0.9rem] font-semibold text-paper">{t.name}</span>
                              <span className="block font-mono text-[0.6rem] tracking-[0.14em] uppercase" style={{ color: accent }}>
                                Area · {t.area}
                              </span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </div>
      </Reveal>

      {/* detail */}
      <div id="toolbelt-detail" className="mt-6 grid min-h-[128px] gap-6 lg:grid-cols-[1fr_1fr]" aria-live="polite">
        <AnimatePresence mode="wait">
          {featured !== null ? (
            <motion.div key={featured} className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
              <p className="font-mono text-[0.64rem] tracking-[0.22em] uppercase" style={{ color: accent }}>
                Tool unlocked · {pad2(featured + 1)}
              </p>
              <p className="mt-2 text-[1.6rem] font-semibold tracking-tight">{working.tools[featured].name}</p>
              <p className="mt-1 text-[1.05rem] text-dim">{working.tools[featured].description}</p>
            </motion.div>
          ) : (
            <motion.div key="empty" className="grid place-items-center rounded-2xl border border-dashed border-line p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-mono text-[0.7rem] tracking-[0.16em] text-faint uppercase">Press Space to unlock the toolbelt</p>
            </motion.div>
          )}
        </AnimatePresence>
        <Reveal show={allUnlocked} delay={0.2}>
          <div className="h-full rounded-2xl border border-line p-6">
            <p className="mono-label">Why they exist</p>
            <p className="mt-3 text-[1.2rem] leading-snug">{working.toolOrigin}</p>
            <p className="mt-2 text-[1.05rem] text-dim">{working.toolPurpose}</p>
            <p className="mt-1 text-[1.05rem] text-faint">Custom solutions, instead of relying on plugins.</p>
          </div>
        </Reveal>
      </div>

      <Reveal show={beat >= 2} blur className="mt-8">
        <p className="text-[clamp(1.5rem,2.3vw,2.2rem)] font-medium tracking-tight">
          Instead of only learning more things, I started <span style={{ color: accent }}>building things that make the team faster.</span>
        </p>
      </Reveal>
    </Stage>
  )
}

/* ------------------------------------------------------------------ */
/* 6. It wasn't clean                                                  */
/* ------------------------------------------------------------------ */

// Illustrative structure: a root, three systems, six parts.
const ORGANIZED: Array<[number, number]> = [
  [240, 46], [100, 170], [240, 170], [380, 170], [58, 300], [142, 300], [198, 300], [282, 300], [338, 300], [422, 300],
]
const MESSY: Array<[number, number]> = [
  [320, 250], [90, 92], [410, 104], [176, 318], [300, 58], [436, 300], [58, 228], [214, 162], [118, 334], [360, 186],
]
const TREE_EDGES: Array<[number, number]> = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 6], [2, 7], [3, 8], [3, 9]]
const TANGLE_EDGES: Array<[number, number]> = [[4, 9], [6, 3], [8, 2], [5, 7], [1, 9], [7, 4]]
const ROUND_T = [0, 0.42, 0.78, 1]
const TANGLE_OPACITY = [1, 0.55, 0.2, 0]
const ROUND_LABEL = ['Messy', 'Restructuring', 'Restructuring', 'Organized']

function pos(i: number, round: number): [number, number] {
  const t = ROUND_T[round]
  return [MESSY[i][0] + (ORGANIZED[i][0] - MESSY[i][0]) * t, MESSY[i][1] + (ORGANIZED[i][1] - MESSY[i][1]) * t]
}

function NotCleanScene({ beat, mountBeat, accent }: SceneProps) {
  const round = useSteppedValue(beat >= 3 ? working.rebuildRounds : 0, 1150, mountBeat >= 3)
  const organized = round === working.rebuildRounds
  const spring = { type: 'spring' as const, stiffness: 70, damping: 16 }

  return (
    <Stage wide>
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <Kicker accent={accent}>Working Knowledge · Challenges</Kicker>
          </Reveal>
          <Reveal delay={0.06} blur>
            <h2 className="display mt-4 text-[clamp(3rem,5.2vw,5.4rem)]">It wasn&apos;t clean.</h2>
          </Reveal>

          <ol className="mt-9 space-y-3">
            {working.challenges.map((c, i) => (
              <Reveal as="li" key={c.title} show={beat >= i + 1} x={-20} y={0}>
                <div className="glass flex gap-5 rounded-2xl p-5">
                  <span className="font-mono text-[0.72rem] tracking-[0.16em]" style={{ color: accent }}>
                    {pad2(i + 1)}
                  </span>
                  <div>
                    <p className="text-[1.25rem] font-semibold tracking-tight">{c.title}</p>
                    <p className="mt-1 text-[1rem] leading-snug text-dim">{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal show={beat >= 4} blur className="mt-9">
            <p className="text-[clamp(1.6rem,2.4vw,2.3rem)] font-medium tracking-tight">
              This was where the learning <span style={{ color: accent }}>became real.</span>
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2} y={24}>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="mono-label">Project structure · illustrative</span>
              <span className="font-mono text-[0.7rem] tracking-[0.16em] tabular-nums" style={{ color: round > 0 ? accent : COLORS.dim }}>
                REBUILD {round} / {working.rebuildRounds}
              </span>
            </div>
            <svg viewBox="0 0 480 360" className="mt-4 w-full" role="img" aria-label={`Illustration: project structure after ${round} of ${working.rebuildRounds} rebuild rounds`}>
              {TANGLE_EDGES.map(([a, b]) => {
                const [x1, y1] = pos(a, round)
                const [x2, y2] = pos(b, round)
                return <motion.line key={`t${a}-${b}`} initial={false} animate={{ x1, y1, x2, y2, opacity: TANGLE_OPACITY[round] }} transition={spring} stroke={COLORS.alert} strokeOpacity="0.55" strokeDasharray="4 5" />
              })}
              {TREE_EDGES.map(([a, b]) => {
                const [x1, y1] = pos(a, round)
                const [x2, y2] = pos(b, round)
                return <motion.line key={`e${a}-${b}`} initial={false} animate={{ x1, y1, x2, y2 }} transition={spring} stroke={organized ? hexA(accent, 0.6) : 'rgba(255,255,255,0.22)'} strokeWidth="1.5" />
              })}
              {ORGANIZED.map((_, i) => {
                const [cx, cy] = pos(i, round)
                const size = i === 0 ? 30 : i <= 3 ? 22 : 16
                return (
                  <motion.rect
                    key={i}
                    width={size}
                    height={size}
                    rx="4"
                    initial={false}
                    animate={{ x: cx - size / 2, y: cy - size / 2, fill: organized ? (i === 0 ? accent : mixHex(accent, '#131316', 0.28)) : '#1c1c21' }}
                    transition={spring}
                    stroke={organized ? accent : 'rgba(255,255,255,0.3)'}
                    strokeWidth="1.2"
                  />
                )
              })}
            </svg>
            <div className="mt-2 flex items-center justify-between font-mono text-[0.64rem] tracking-[0.16em] uppercase">
              <span style={{ color: organized ? COLORS.ok : COLORS.alert }}>{ROUND_LABEL[round]}</span>
              <span className="text-faint">{working.rebuildRounds} rounds, including the migration</span>
            </div>
          </div>
        </Reveal>
      </div>
    </Stage>
  )
}

/* ------------------------------------------------------------------ */
/* 7. The PAC moment                                                   */
/* ------------------------------------------------------------------ */

function PacScene({ beat, accent }: SceneProps) {
  const words = working.pac.beats
  const wordIdx = Math.min(beat, words.length - 1)
  const revealed = beat >= words.length

  return (
    <Stage wide className="items-center text-center">
      <ol className="flex flex-wrap items-center justify-center gap-3 font-mono text-[0.74rem] tracking-[0.24em] uppercase" aria-label="Learning to pressure">
        {words.map((w, i) => (
          <li key={w} className="flex items-center gap-3">
            <motion.span initial={false} animate={{ color: i <= wordIdx ? (i === wordIdx && !revealed ? accent : COLORS.dim) : '#2c2d33' }} transition={{ duration: 0.4 }}>
              {w}
            </motion.span>
            {i < words.length - 1 && <span className="text-faint">→</span>}
          </li>
        ))}
      </ol>

      <div className="relative mt-8 flex min-h-[48vh] w-full items-center justify-center">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.p
              key={words[wordIdx]}
              className="display text-[clamp(5rem,13vw,13.5rem)] uppercase"
              initial={{ opacity: 0, scale: 1.18, filter: 'blur(18px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(14px)' }}
              transition={{ duration: 0.55, ease: EASE_OUT }}
            >
              {words[wordIdx]}
            </motion.p>
          ) : (
            <motion.div key="prize" className="flex w-full flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              <motion.div className="relative grid size-28 place-items-center" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.1 }}>
                <span aria-hidden className="absolute inset-[-40%] rounded-full" style={{ background: `radial-gradient(circle, ${hexA(accent, 0.35)}, transparent 65%)` }} />
                <motion.span aria-hidden className="absolute inset-0 rounded-full border" style={{ borderColor: hexA(accent, 0.5) }} animate={{ scale: [1, 1.5], opacity: [0.7, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }} />
                <span className="relative grid size-28 place-items-center rounded-full border bg-ink-2" style={{ borderColor: hexA(accent, 0.6) }}>
                  <Trophy size={46} strokeWidth={1.4} style={{ color: accent }} />
                </span>
              </motion.div>
              <Reveal delay={0.35}>
                <p className="mono-label mt-8" style={{ color: accent }}>
                  PAC
                </p>
              </Reveal>
              <Reveal delay={0.45} blur>
                <h2 className="display mt-3 text-[clamp(3.6rem,7vw,7.2rem)]">Token Prize</h2>
              </Reveal>
              <ul className="mt-10 grid w-full max-w-5xl gap-4 text-left md:grid-cols-3">
                {working.pac.facts.map((f, i) => (
                  <Reveal as="li" key={f} delay={0.7 + i * 0.12}>
                    <div className="glass h-full rounded-xl p-5">
                      <span className="font-mono text-[0.62rem] tracking-[0.2em]" style={{ color: accent }}>
                        {pad2(i + 1)}
                      </span>
                      <p className="mt-2 text-[1.1rem] leading-snug">{f}</p>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Reveal show={beat >= words.length + 1} blur className="mt-8">
        <p className="max-w-[46ch] text-[clamp(1.4rem,2.2vw,2.1rem)] tracking-tight">“{working.pac.reflection}”</p>
      </Reveal>
    </Stage>
  )
}

/* ------------------------------------------------------------------ */
/* 8. Recap and 9. the metric finale                                   */
/* ------------------------------------------------------------------ */

function RecapScene({ beat, accent }: SceneProps) {
  return <FourQuestions data={working.recap} beat={beat} accent={accent} chapterTitle={chapterById('working').title} status={quests.working.status} />
}

function MetricsFinaleScene({ beat, accent }: SceneProps) {
  const converge = beat >= 1

  return (
    <Stage wide>
      <div className="relative flex min-h-[62vh] items-center justify-center">
        <ul className="grid w-full grid-cols-4 gap-6">
          {working.metrics.map((m, i) => (
            <motion.li
              key={m.label}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={converge ? { opacity: 0, x: `${(1.5 - i) * 100}%`, y: 0, scale: 0.25 } : { opacity: 1, x: '0%', y: 0, scale: 1 }}
              transition={{ duration: converge ? 0.9 : 0.9, delay: converge ? i * 0.04 : 0.1 + i * 0.12, ease: EASE_OUT }}
              aria-hidden={converge}
            >
              <MetricCounter value={m.value} delay={0.2 + i * 0.12} className="display text-[clamp(6rem,12.5vw,13rem)] leading-none" />
              <p className="mt-5 font-mono text-[0.8rem] tracking-[0.24em] uppercase" style={{ color: accent }}>
                {m.label}
              </p>
              <p className="mt-2 text-[1rem] text-dim">{m.context}</p>
            </motion.li>
          ))}
        </ul>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 text-center">
          <Reveal show={converge} delay={0.6} blur>
            <p className="display text-[clamp(2.6rem,5vw,5.2rem)] text-dim">The goal wasn&apos;t to know more.</p>
          </Reveal>
          <Reveal show={beat >= 2} delay={0.15} blur y={26}>
            <p className="display text-[clamp(3.2rem,6.6vw,7rem)]">
              It was to become <span style={{ color: accent }}>more useful.</span>
            </p>
          </Reveal>
        </div>
      </div>
    </Stage>
  )
}

export const workingScenes: SceneDef[] = [
  { id: 'wk-intro', chapter: 'working', title: 'Working Knowledge', beats: 2, Component: IntroScene },
  briefingScene('working', 'wk-briefing'),
  { id: 'wk-loop', chapter: 'working', title: 'The learning loop', beats: 3, Component: LearningLoopScene },
  { id: 'wk-challenge', chapter: 'working', title: 'Challenge: engine migration', beats: 5, Component: MigrationChallengeScene },
  { id: 'wk-map', chapter: 'working', title: 'Engineering growth map', beats: 4, Component: GrowthMapScene },
  { id: 'wk-certificates', chapter: 'working', title: 'Certificates', beats: working.certificates.length, Component: CertificateCarousel },
  { id: 'wk-toolbelt', chapter: 'working', title: 'The toolbelt', beats: 3, Component: ToolbeltScene },
  { id: 'wk-not-clean', chapter: 'working', title: "It wasn't clean", beats: 5, Component: NotCleanScene },
  { id: 'wk-pac', chapter: 'working', title: 'The PAC moment', beats: 6, Component: PacScene },
  { id: 'wk-recap', chapter: 'working', title: 'Recap', beats: 4, Component: RecapScene },
  { id: 'wk-finale', chapter: 'working', title: 'More useful', beats: 3, Component: MetricsFinaleScene },
]
