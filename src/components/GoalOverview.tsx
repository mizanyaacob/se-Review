import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { sfx } from '../lib/sfx'
import { StartHero } from '../chapters/Opening'
import { beatsPerChapter, scenes, scenesPerChapter } from '../chapters'
import { chapters, epilogue, glance, person, type ChapterMeta, type GoalChapterId } from '../data/selfEvaluation'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { EASE_OUT, cn, hexA, pad2 } from '../lib/utils'
import { SHORTCUTS } from './game/shortcuts'

const ARC: Record<string, string> = {
  working: 'I learned deeply',
  retaining: 'I shared what I learned',
  personal: 'I stayed balanced',
  departmental: 'I contributed beyond gameplay',
  organizational: 'I contributed beyond my team',
}

export function GoalOverview({ onStart }: { onStart: (sceneId?: string) => void }) {
  const progress = useScrollProgress()

  // "Press Enter to start", like a title screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.metaKey || e.ctrlKey || e.altKey) return
      if ((e.target as HTMLElement | null)?.closest('button, a, input, textarea')) return
      e.preventDefault()
      sfx.play('select')
      onStart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onStart])
  const goals = chapters.filter((c) => c.goal)
  const firstSceneOf = (id: string) => scenes.find((s) => s.chapter === id)?.id
  const totalSteps = Object.values(beatsPerChapter).reduce((a, b) => a + b, 0)

  return (
    <div className="relative min-h-svh bg-ink">
      <motion.div aria-hidden className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-paper/60" style={{ scaleX: progress }} />

      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between bg-ink/75 px-8 backdrop-blur-md md:px-14">
        <div className="leading-tight">
          <p className="font-mono text-[0.72rem] font-medium tracking-[0.24em] uppercase">{person.shortName}</p>
          <p className="font-mono text-[0.6rem] tracking-[0.2em] text-faint uppercase">{person.review}</p>
        </div>
        <button type="button" onClick={() => onStart()} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[0.66rem] tracking-[0.16em] text-dim uppercase transition-colors hover:border-line-2 hover:text-paper">
          Presentation mode <ArrowUpRight size={14} />
        </button>
      </header>

      <StartHero onStart={() => onStart()} />

      <section id="overview" className="relative mx-auto max-w-[1240px] scroll-mt-10 px-8 py-28 md:px-14">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="self-start lg:sticky lg:top-28">
            <InView>
              <p className="mono-label">Self-evaluation · 2026</p>
            </InView>
            <InView delay={0.08}>
              <h2 className="display mt-6 text-[clamp(3rem,5vw,5.2rem)]">
                A year of learning, adapting, <span className="text-dim">and contributing.</span>
              </h2>
            </InView>
            <InView delay={0.16}>
              <p className="mt-6 max-w-[38ch] text-[1.15rem] text-dim">
                {person.name} · {person.role} · {person.studio}. Five goals, told as one story, in order of priority.
              </p>
            </InView>
            <InView delay={0.24}>
              <button
                type="button"
                onClick={() => onStart()}
                className="group mt-10 inline-flex items-center gap-4 rounded-full bg-paper py-3.5 pr-4 pl-6 font-semibold tracking-tight text-ink transition-transform hover:scale-[1.02]"
              >
                Start the story
                <span className="grid size-7 place-items-center rounded-full bg-ink text-paper transition-transform group-hover:translate-x-1">
                  <ArrowRight size={14} />
                </span>
              </button>
              <p className="mt-4 font-mono text-[0.62rem] tracking-[0.16em] text-faint uppercase">
                {scenes.length} scenes · {totalSteps} steps
              </p>
            </InView>
            <InView delay={0.32}>
              <dl className="mt-12 grid max-w-sm grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 border-t border-line pt-6">
                {SHORTCUTS.slice(0, 5).map(([keys, action]) => (
                  <div key={action} className="contents">
                    <dt className="flex gap-1">
                      {keys.slice(0, 2).map((k) => (
                        <span key={k} className="kbd">
                          {k}
                        </span>
                      ))}
                    </dt>
                    <dd className="text-[0.9rem] text-dim">{action}</dd>
                  </div>
                ))}
              </dl>
            </InView>
          </div>

          <ol className="space-y-3">
            <ChapterRow meta={chapters[0]} onOpen={() => onStart(firstSceneOf('prologue'))} scenesCount={scenesPerChapter.prologue} beats={beatsPerChapter.prologue} />
            {goals.map((g) => (
              <ChapterRow key={g.id} meta={g} onOpen={() => onStart(firstSceneOf(g.id))} scenesCount={scenesPerChapter[g.id]} beats={beatsPerChapter[g.id]} />
            ))}
            <ChapterRow meta={chapters[chapters.length - 1]} onOpen={() => onStart(firstSceneOf('epilogue'))} scenesCount={scenesPerChapter.epilogue} beats={beatsPerChapter.epilogue} />
          </ol>
        </div>

        <div className="mt-32 border-t border-line pt-16">
          {epilogue.thesis.map((line, i) => (
            <InView key={line} delay={i * 0.12}>
              <p className={cn('display text-[clamp(2.4rem,4.6vw,4.8rem)]', i < 2 && 'text-faint')}>{line}</p>
            </InView>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1240px] items-center justify-between border-t border-line px-8 py-8 font-mono text-[0.62rem] tracking-[0.16em] text-faint uppercase md:px-14">
        <span>
          {person.name} · {person.studio}
        </span>
        <span>Source · Self-Evaluation Review 2026</span>
      </footer>
    </div>
  )
}

function ChapterRow({ meta, onOpen, scenesCount, beats }: { meta: ChapterMeta; onOpen: () => void; scenesCount: number; beats: number }) {
  const primary = meta.id === 'working'
  const secondary = meta.id === 'retaining'
  const bookend = !meta.goal

  return (
    <InView as="li">
      <motion.button
        type="button"
        onClick={onOpen}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.25 }}
        className={cn(
          'group relative w-full overflow-hidden rounded-2xl border text-left transition-colors duration-300',
          primary ? 'p-9' : secondary ? 'p-7' : bookend ? 'px-7 py-4' : 'px-7 py-5',
          bookend ? 'border-transparent hover:border-line' : 'border-line hover:border-line-2',
        )}
        style={primary ? { borderColor: hexA(meta.accent, 0.4), background: `linear-gradient(135deg, ${hexA(meta.accent, 0.12)}, transparent 60%)` } : undefined}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-baseline gap-5">
            <span className="font-mono text-[0.8rem] tabular-nums" style={{ color: bookend ? undefined : meta.accent }}>
              {meta.goal ? pad2(meta.goal) : '—'}
            </span>
            <div>
              {primary && (
                <span className="mb-4 inline-block rounded-full px-3 py-1 font-mono text-[0.6rem] font-semibold tracking-[0.2em] text-ink uppercase" style={{ background: meta.accent }}>
                  Primary chapter
                </span>
              )}
              <h3 className={cn('font-semibold tracking-tight', primary ? 'text-[clamp(2.4rem,3.6vw,3.4rem)] leading-none' : secondary ? 'text-[1.9rem] leading-tight' : bookend ? 'text-[1.05rem] text-dim' : 'text-[1.4rem] leading-tight')}>
                {meta.label}
              </h3>
              {!bookend && <p className={cn('mt-2 text-dim', primary ? 'text-[1.2rem]' : 'text-[1rem]')}>{meta.subtitle}</p>}
              {ARC[meta.id] && (
                <p className="mt-4 font-mono text-[0.64rem] tracking-[0.18em] uppercase" style={{ color: meta.accent }}>
                  → {ARC[meta.id]}
                </p>
              )}
              {/* the target I wrote down against where the goal actually landed */}
              {meta.goal && (
                <dl className="mt-5 grid max-w-[54ch] grid-cols-[3.4rem_1fr] gap-x-4 gap-y-1.5 border-t border-line pt-4">
                  <dt className="mono-label pt-0.5">Target</dt>
                  <dd className="text-[0.98rem] text-dim">{glance[meta.id as GoalChapterId].target}</dd>
                  <dt className="mono-label pt-0.5" style={{ color: meta.accent }}>
                    Result
                  </dt>
                  <dd className="text-[0.98rem]">{glance[meta.id as GoalChapterId].result}</dd>
                </dl>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="font-mono text-[0.6rem] tracking-[0.16em] text-faint uppercase">
              {scenesCount} {scenesCount === 1 ? 'scene' : 'scenes'} · {beats} steps
            </span>
            <ArrowRight size={18} className="text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-paper" />
          </div>
        </div>
      </motion.button>
    </InView>
  )
}

function InView({ children, delay = 0, as = 'div' }: { children: ReactNode; delay?: number; as?: 'div' | 'li' }) {
  const Comp = as === 'li' ? motion.li : motion.div
  return (
    <Comp initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, delay, ease: EASE_OUT }}>
      {children}
    </Comp>
  )
}
