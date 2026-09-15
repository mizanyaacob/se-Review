import { motion } from 'motion/react'
import type { SceneProps } from '../chapters/types'
import { chapterById, person, type Briefing, type GoalChapterId } from '../data/selfEvaluation'
import { COLORS, cn, hexA, pad2 } from '../lib/utils'
import { PixelHero } from './game/PixelHero'
import { Reveal } from './Reveal'
import { Stage } from './Stage'

interface BriefingSceneProps extends SceneProps {
  chapterId: GoalChapterId
  data: Briefing
}

/**
 * RPG-style mission briefing: a portrait on the left, context cards revealed one per beat.
 * Beats: data.blocks.length (the first card shows immediately).
 */
export function BriefingScene({ beat, accent, chapterId, data }: BriefingSceneProps) {
  const meta = chapterById(chapterId)
  const current = Math.min(beat, data.blocks.length - 1)
  const more = beat < data.blocks.length - 1

  return (
    <Stage wide>
      <div className="grid items-center gap-14 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <Reveal>
            <p className="font-pixel text-[16px] tracking-[2px] uppercase" style={{ color: accent }}>
              Mission briefing
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mono-label mt-4">
              Goal {pad2(meta.goal ?? 0)} · {meta.label}
            </p>
          </Reveal>
          <Reveal delay={0.1} blur>
            <h2 className="display mt-4 text-[clamp(2.6rem,4.4vw,4.6rem)]">{data.heading}</h2>
          </Reveal>

          {/* speaker portrait, like a dialogue box in an RPG */}
          <Reveal delay={0.25} className="mt-10 flex items-center gap-5">
            <span
              className="relative grid size-24 place-items-center overflow-hidden rounded-xl border-2"
              style={{ borderColor: hexA(accent, 0.6), background: `linear-gradient(180deg, ${hexA(accent, 0.18)}, #101013)` }}
            >
              <span aria-hidden className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 4px)' }} />
              <span className="translate-y-2">
                <PixelHero accent={accent} scale={4} />
              </span>
            </span>
            <span>
              <span className="block text-[1.2rem] font-semibold tracking-tight">{person.shortName}</span>
              <span className="block font-mono text-[0.66rem] tracking-[0.18em] text-dim uppercase">{person.role}</span>
              <span className="mt-3 flex gap-1.5" aria-label={`Briefing ${current + 1} of ${data.blocks.length}`}>
                {data.blocks.map((b, i) => (
                  <span key={b.label} className="h-1.5 w-5 rounded-[1px] transition-colors duration-300" style={{ background: i <= beat ? accent : 'rgba(255,255,255,0.12)' }} />
                ))}
              </span>
            </span>
          </Reveal>
        </div>

        <ol className="space-y-3">
          {data.blocks.map((block, i) => {
            const active = i === current
            return (
              <Reveal as="li" key={block.label} show={beat >= i} x={28} y={0} duration={0.6}>
                <article
                  className="relative rounded-2xl border px-7 py-6 transition-colors duration-500"
                  style={{
                    borderColor: active ? hexA(accent, 0.5) : COLORS.line,
                    background: active ? `linear-gradient(135deg, ${hexA(accent, 0.1)}, rgba(255,255,255,0.015))` : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs" style={{ color: accent }}>
                      {pad2(i + 1)}
                    </span>
                    <span className="mono-label">{block.label}</span>
                  </div>
                  <p className={cn('mt-3 max-w-[60ch] text-[clamp(1.12rem,1.45vw,1.38rem)] leading-snug tracking-tight transition-colors duration-500', active ? 'text-paper' : 'text-dim')}>
                    {block.text}
                  </p>
                  {active && more && (
                    <motion.span
                      aria-hidden
                      className="absolute right-6 bottom-4 font-mono text-[0.8rem]"
                      style={{ color: accent }}
                      animate={{ y: [0, 4, 0], opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ▼
                    </motion.span>
                  )}
                </article>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </Stage>
  )
}
