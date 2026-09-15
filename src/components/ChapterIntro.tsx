import { AnimatePresence, motion } from 'motion/react'
import type { SceneProps } from '../chapters/types'
import { chapterById, type ChapterId } from '../data/selfEvaluation'
import { useMouseParallax } from '../hooks/useMouseParallax'
import { EASE_OUT, cn, hexA, pad2 } from '../lib/utils'
import { Reveal } from './Reveal'
import { Kicker, Stage } from './Stage'

interface ChapterIntroProps extends SceneProps {
  chapterId: ChapterId
  titleLines: string[]
  /** Transition questions shown one per beat before the title card. */
  lines?: string[]
  wanted: string[]
  target?: string
  major?: boolean
}

/**
 * Chapter opener: optional bridging questions → title card → "What I wanted".
 * Beats: lines.length + 2.
 */
export function ChapterIntro({ beat, accent, chapterId, titleLines, lines = [], wanted, target, major = false }: ChapterIntroProps) {
  const meta = chapterById(chapterId)
  const titleBeat = lines.length
  const showTitle = beat >= titleBeat
  const { x, y } = useMouseParallax(major ? 28 : 16)

  return (
    <Stage wide>
      <AnimatePresence mode="wait">
        {!showTitle ? (
          <motion.div key="lines" className="flex flex-col gap-8" exit={{ opacity: 0, y: -24, filter: 'blur(8px)' }} transition={{ duration: 0.45 }}>
            {lines.map((line, i) => (
              <Reveal key={line} show={beat >= i} blur y={24}>
                <p className={cn('display text-[clamp(2.8rem,5.4vw,5.6rem)] transition-colors duration-700', beat > i ? 'text-faint' : 'text-paper')}>{line}</p>
              </Reveal>
            ))}
          </motion.div>
        ) : (
          <motion.div key="title" className="relative grid items-end gap-14 lg:grid-cols-[1.3fr_0.7fr]" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
            {meta.goal && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute right-[-1vw] leading-none font-semibold tracking-tighter text-transparent select-none"
                style={{ x, y, top: major ? '-20vh' : '-22vh', fontSize: major ? '30vh' : '24vh', WebkitTextStroke: `1px ${hexA(accent, major ? 0.3 : 0.22)}` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4 }}
              >
                {pad2(meta.goal)}
              </motion.span>
            )}

            <div className="relative">
              <Reveal>
                <Kicker accent={accent}>
                  {meta.goal ? `Goal ${pad2(meta.goal)} · Priority ${meta.goal}` : meta.label}
                  {major && ' · Primary chapter'}
                </Kicker>
              </Reveal>
              <h1 className={cn('display mt-6', major ? 'text-[clamp(4.2rem,10.4vw,11rem)]' : 'text-[clamp(3.2rem,6.4vw,6.8rem)]')}>
                {titleLines.map((t, i) => (
                  <motion.span
                    key={t}
                    className="block"
                    initial={{ opacity: 0, y: 60, filter: 'blur(12px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 1, delay: 0.1 + i * 0.12, ease: EASE_OUT }}
                  >
                    {t}
                  </motion.span>
                ))}
              </h1>
              <Reveal delay={0.45}>
                <p className="mt-7 max-w-[36ch] text-[clamp(1.25rem,1.8vw,1.7rem)] text-dim">{meta.subtitle}</p>
              </Reveal>
            </div>

            <Reveal show={beat >= titleBeat + 1} y={28} className="relative">
              <WantedPanel wanted={wanted} target={target} accent={accent} />
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  )
}

export function WantedPanel({ wanted, target, accent }: { wanted: string[]; target?: string; accent: string }) {
  return (
    <div className="glass rounded-2xl p-7">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs" style={{ color: accent }}>
          01
        </span>
        <span className="mono-label">What I wanted</span>
      </div>
      <ul className="mt-6 space-y-3.5">
        {wanted.map((w) => (
          <li key={w} className="flex items-baseline gap-3 text-[1.12rem] leading-snug">
            <span className="size-1.5 shrink-0 translate-y-[-3px] rounded-[2px]" style={{ background: accent }} />
            {w}
          </li>
        ))}
      </ul>
      {target && (
        <div className="mt-7 flex items-center justify-between gap-4 border-t border-line pt-5">
          <span className="mono-label">Target</span>
          <span className="font-mono text-sm text-paper">{target}</span>
        </div>
      )}
    </div>
  )
}
