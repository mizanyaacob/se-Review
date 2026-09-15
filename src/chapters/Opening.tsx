import { ArrowDown, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { EngineMigration } from '../components/EngineMigration'
import { PixelHero } from '../components/game/PixelHero'
import { Reveal } from '../components/Reveal'
import { Kicker, Stage } from '../components/Stage'
import { StatusDot } from '../components/StatusDot'
import { originalPlan, person, productionQuestions } from '../data/selfEvaluation'
import { useMouseParallax } from '../hooks/useMouseParallax'
import { COLORS, EASE_OUT, hexA } from '../lib/utils'
import type { SceneDef, SceneProps } from './types'

function Glitch({ active, color, children }: { active: boolean; color: string; children: ReactNode }) {
  return (
    <motion.span
      className="relative inline-block"
      style={{ color }}
      initial={false}
      animate={active ? { x: [0, -5, 4, -2, 1, 0], skewX: [0, -10, 8, -3, 0, 0] } : { x: 0, skewX: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
    >
      {children}
    </motion.span>
  )
}

/* ------------------------------------------------------------------ */
/* Start screen (top of the overview page)                             */
/* ------------------------------------------------------------------ */

export function StartHero({ onStart }: { onStart: () => void }) {
  const { x, y } = useMouseParallax(18)
  const warn = COLORS.warn

  return (
    <section className="relative flex min-h-svh flex-col justify-center overflow-hidden px-8 md:px-14">
      <motion.div aria-hidden className="grid-backdrop absolute -inset-16" style={{ x, y }} />
      <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(50% 45% at 80% 10%, ${hexA(warn, 0.1)}, transparent 70%)` }} />

      <div className="relative mx-auto w-full max-w-[1240px]">
        <Reveal delay={0.1}>
          <Kicker>
            {person.name} · {person.studio} · {person.review}
          </Kicker>
        </Reveal>

        <Reveal delay={0.5} blur y={24} duration={1.1}>
          <h1 className="display mt-10 text-[clamp(3.4rem,7.4vw,7.8rem)]">I had a plan for this year.</h1>
        </Reveal>
        <Reveal delay={1.9} blur y={24} duration={1.1}>
          <p className="display mt-4 text-[clamp(3.4rem,7.4vw,7.8rem)] text-dim">
            Then the project <Glitch active color={warn}>changed.</Glitch>
          </p>
        </Reveal>

        <Reveal delay={3} className="mt-14 flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={onStart}
            className="group inline-flex items-center gap-4 rounded-full bg-paper py-4 pr-5 pl-7 text-[1.05rem] font-semibold tracking-tight text-ink transition-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            Start the story
            <span className="grid size-8 place-items-center rounded-full bg-ink text-paper transition-transform group-hover:translate-x-1">
              <ArrowRight size={16} />
            </span>
          </button>
          <a href="#overview" className="inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.16em] text-dim uppercase hover:text-paper">
            Or see the chapters <ArrowDown size={14} />
          </a>
        </Reveal>

        <Reveal delay={3.4} className="mt-16 flex items-end gap-4">
          <PixelHero accent={warn} scale={3} />
          <motion.p
            className="font-pixel pb-1 text-[16px] tracking-[2px] text-paper uppercase"
            animate={{ opacity: [1, 1, 0.15, 0.15] }}
            transition={{ duration: 1.2, times: [0, 0.5, 0.55, 1], repeat: Infinity }}
          >
            Press Enter to start
          </motion.p>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Act 1 — the plan                                                    */
/* ------------------------------------------------------------------ */

function ThePlanScene({ beat }: SceneProps) {
  const interrupted = beat >= 2
  const warn = COLORS.warn

  return (
    <Stage wide>
      <div className="grid items-center gap-20 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Reveal>
            <Kicker>Act 1 · The plan</Kicker>
          </Reveal>
          <Reveal delay={0.1} blur>
            <h1 className="display mt-6 text-[clamp(3rem,5.4vw,5.8rem)]">I thought this year would be about getting better at the engine.</h1>
          </Reveal>
          <Reveal show={interrupted} className="mt-12" blur>
            <p className="text-[clamp(1.9rem,3.2vw,3rem)] font-medium tracking-tight">
              Then the project{' '}
              <Glitch active={interrupted} color={warn}>
                changed.
              </Glitch>
            </p>
          </Reveal>
        </div>

        <Reveal show={beat >= 1} y={30}>
          <motion.div
            className="glass rounded-2xl p-8"
            initial={false}
            animate={interrupted ? { rotate: -3, y: 14 } : { rotate: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 11, delay: interrupted ? 0.35 : 0 }}
          >
            <div className="flex items-center justify-between border-b border-line pb-5">
              <span className="font-mono text-sm tracking-[0.16em] text-paper">PLAN · 2026</span>
              <StatusDot label={interrupted ? 'Interrupted' : 'On track'} color={interrupted ? warn : COLORS.ok} pulse={interrupted} />
            </div>
            <ul className="mt-6 space-y-4">
              {originalPlan.map((item, i) => (
                <Reveal as="li" key={item} show={beat >= 1} delay={0.2 + i * 0.09} x={14} y={0} className="flex items-center gap-4">
                  <span className="size-5 shrink-0 rounded-[5px] border border-line-2" />
                  <motion.span className="text-[1.2rem]" initial={false} animate={{ color: interrupted ? COLORS.faint : COLORS.paper }} transition={{ duration: 0.6, delay: interrupted ? 0.4 : 0 }}>
                    {item}
                  </motion.span>
                </Reveal>
              ))}
            </ul>
          </motion.div>
        </Reveal>
      </div>
    </Stage>
  )
}

/* ------------------------------------------------------------------ */
/* Act 2 — student level vs production level                            */
/* ------------------------------------------------------------------ */

function RelearningScene({ beat }: SceneProps) {
  const warn = COLORS.warn

  return (
    <Stage wide>
      <Reveal>
        <Kicker>Act 2 · Relearning</Kicker>
      </Reveal>

      <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1.4fr]">
        <Reveal y={24}>
          <div className="glass flex h-full min-h-[300px] flex-col justify-between rounded-2xl p-8">
            <p className="mono-label">Student level</p>
            <div className="relative self-start">
              <p className="display text-[clamp(2.2rem,3.2vw,3.2rem)] whitespace-nowrap text-dim">“Whatever works.”</p>
              <motion.span
                aria-hidden
                className="absolute top-[55%] right-0 left-0 h-[3px] origin-left rounded-full"
                style={{ background: warn }}
                initial={false}
                animate={{ scaleX: beat >= 1 ? 1 : 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
              />
            </div>
            <p className="mono-label text-faint">Before</p>
          </div>
        </Reveal>

        <div className="flex items-center justify-center">
          <motion.span initial={false} animate={{ opacity: beat >= 1 ? 1 : 0.12, x: beat >= 1 ? 0 : -10 }} transition={{ duration: 0.5 }}>
            <ArrowRight size={40} strokeWidth={1.5} style={{ color: warn }} />
          </motion.span>
        </div>

        <Reveal y={24} delay={0.1}>
          <div className="glass h-full min-h-[300px] rounded-2xl p-8 transition-colors duration-700" style={{ borderColor: beat >= 1 ? hexA(warn, 0.35) : undefined }}>
            <p className="mono-label" style={{ color: warn }}>
              Production level
            </p>
            <ul className="mt-8 space-y-6">
              {productionQuestions.map((q, i) => (
                <Reveal as="li" key={q} show={beat >= i + 1} x={-18} y={0} className="flex items-baseline gap-4 text-[clamp(1.5rem,2.3vw,2.25rem)] font-medium tracking-tight">
                  <span className="font-mono text-base" style={{ color: warn }}>
                    ?
                  </span>
                  “{q}”
                </Reveal>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal show={beat >= 4} blur className="mt-14">
        <p className="display text-[clamp(2.6rem,4.6vw,4.8rem)]">
          I had to <span style={{ color: warn }}>relearn</span> something I thought I already knew.
        </p>
      </Reveal>
    </Stage>
  )
}

export const prologueScenes: SceneDef[] = [
  { id: 'plan', chapter: 'prologue', title: 'The plan', beats: 3, Component: ThePlanScene },
  { id: 'ground-moved', chapter: 'prologue', title: 'Then the ground moved', beats: 4, Component: EngineMigration },
  { id: 'relearning', chapter: 'prologue', title: 'Student level vs production level', beats: 5, Component: RelearningScene },
]
