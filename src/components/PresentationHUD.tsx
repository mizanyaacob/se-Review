import { ChevronLeft, ChevronRight, Gauge, LayoutGrid, Maximize2, Minimize2, ScrollText, Volume2, VolumeX } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { chapterById, chapters, person, type ChapterId } from '../data/selfEvaluation'
import { COLORS, cn, pad2 } from '../lib/utils'
import { PixelHero } from './game/PixelHero'

interface HUDProps {
  chapter: ChapterId
  /** 0-based scene index within the current chapter, and scene count per chapter. */
  sceneInChapter: number
  scenesPerChapter: Record<ChapterId, number>
  beat: number
  beats: number
  /** Whole-story progress 0→1 and where each chapter starts on that scale. */
  progress: number
  chapterStarts: Array<{ id: ChapterId; at: number }>
  idle: boolean
  fullscreen: boolean
  muted: boolean
  stats: boolean
  achievementsLabel: string
  onChapter: (id: ChapterId) => void
  onPrev: () => void
  onNext: () => void
  onExit: () => void
  onMenu: () => void
  onStats: () => void
  onSound: () => void
  onFullscreen: () => void
}

const GOAL_COUNT = chapters.filter((c) => c.goal).length

/** Minimal presentation chrome with a game-style level track. Fades back when the presenter is idle. */
export function PresentationHUD(props: HUDProps) {
  const { chapter, sceneInChapter, scenesPerChapter, beat, beats, idle, fullscreen, muted, stats } = props
  const meta = chapterById(chapter)
  const currentIndex = chapters.findIndex((c) => c.id === chapter)

  return (
    <motion.div className="pointer-events-none absolute inset-0 z-40" animate={{ opacity: idle ? 0.28 : 1 }} transition={{ duration: 0.6 }}>
      {/* top */}
      <header className="pointer-events-auto absolute inset-x-0 top-0 flex h-16 items-center justify-between gap-6 px-8">
        <div className="leading-tight">
          <p className="font-mono text-[0.72rem] font-medium tracking-[0.24em] text-paper uppercase">{person.shortName}</p>
          <p className="font-mono text-[0.6rem] tracking-[0.2em] text-faint uppercase">{person.review}</p>
        </div>

        <nav aria-label="Chapters" className="flex items-center gap-1.5">
          {chapters.map((c, i) => {
            const active = c.id === chapter
            const done = i < currentIndex
            const fill = active ? (sceneInChapter + 1) / scenesPerChapter[c.id] : done ? 1 : 0
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => props.onChapter(c.id)}
                aria-current={active ? 'step' : undefined}
                aria-label={`${c.goal ? `Goal ${c.goal}: ` : ''}${c.label}`}
                title={c.label}
                className="group flex flex-col items-center gap-1.5 rounded-md px-2 py-1.5"
              >
                <span className={cn('font-mono text-[0.66rem] tracking-[0.14em] transition-colors', active ? 'text-paper' : done ? 'text-dim' : 'text-faint group-hover:text-dim')}>
                  {c.goal ? pad2(c.goal) : c.id === 'prologue' ? 'P' : 'E'}
                </span>
                <span className={cn('relative block h-[2px] overflow-hidden rounded-full bg-white/10', c.id === 'working' ? 'w-14' : 'w-8')}>
                  <motion.span className="absolute inset-0 origin-left rounded-full" style={{ background: active ? c.accent : COLORS.dim }} initial={false} animate={{ scaleX: fill }} transition={{ duration: 0.5 }} />
                </span>
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={props.onMenu}
            className="mr-1 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[0.66rem] tracking-[0.12em] text-dim tabular-nums transition-colors hover:border-line-2 hover:text-paper"
            title="Quest log (Q)"
          >
            <ScrollText size={13} /> {props.achievementsLabel}
          </button>
          <HudButton label={stats ? 'Hide stats (G)' : 'Show stats (G)'} onClick={props.onStats} active={stats}>
            <Gauge size={16} />
          </HudButton>
          <HudButton label={muted ? 'Sound on (M)' : 'Sound off (M)'} onClick={props.onSound} active={!muted}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </HudButton>
          <HudButton label={fullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'} onClick={props.onFullscreen}>
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </HudButton>
          <button
            type="button"
            onClick={props.onExit}
            className="ml-1 inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 font-mono text-[0.64rem] tracking-[0.16em] text-dim uppercase transition-colors hover:border-line-2 hover:text-paper"
          >
            <LayoutGrid size={13} /> Overview <span className="kbd">Esc</span>
          </button>
        </div>
      </header>

      {/* bottom */}
      <footer className="pointer-events-auto absolute inset-x-0 bottom-0 grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-6 px-8">
        <p className="flex items-baseline gap-3 font-mono uppercase">
          {meta.goal ? (
            <>
              <span className="text-[0.95rem] text-paper tabular-nums">{pad2(meta.goal)}</span>
              <span className="text-[0.7rem] text-faint">/ {pad2(GOAL_COUNT)}</span>
            </>
          ) : null}
          <span className="text-[0.68rem] tracking-[0.2em]" style={{ color: meta.accent }}>
            {meta.label}
          </span>
        </p>

        <LevelTrack progress={props.progress} chapterStarts={props.chapterStarts} accent={meta.accent} currentChapter={chapter} />

        <div className="flex items-center justify-end gap-5">
          {beats > 1 && (
            <span className="flex items-center gap-1" aria-label={`Step ${beat + 1} of ${beats}`}>
              {Array.from({ length: beats }, (_, i) => (
                <span key={i} className="h-1 w-1 rounded-full transition-colors duration-300" style={{ background: i <= beat ? meta.accent : 'rgba(255,255,255,0.14)' }} />
              ))}
            </span>
          )}
          <span className="hidden font-mono text-[0.6rem] tracking-[0.16em] text-faint uppercase xl:inline">
            <span className="kbd">Space</span> next
          </span>
          <div className="flex items-center gap-1">
            <HudButton label="Previous step" onClick={props.onPrev}>
              <ChevronLeft size={18} />
            </HudButton>
            <HudButton label="Next step" onClick={props.onNext}>
              <ChevronRight size={18} />
            </HudButton>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}

const TRACK_WIDTH = 380
const HERO_WIDTH = 24

/** Side-scroller style progress: the hero walks to the current point in the story. */
function LevelTrack({ progress, chapterStarts, accent, currentChapter }: { progress: number; chapterStarts: Array<{ id: ChapterId; at: number }>; accent: string; currentChapter: ChapterId }) {
  const [walking, setWalking] = useState(false)
  const [facing, setFacing] = useState<1 | -1>(1)
  const last = useRef(progress)

  useEffect(() => {
    if (progress === last.current) return
    setFacing(progress > last.current ? 1 : -1)
    last.current = progress
    setWalking(true)
    const t = window.setTimeout(() => setWalking(false), 650)
    return () => window.clearTimeout(t)
  }, [progress])

  const x = progress * (TRACK_WIDTH - HERO_WIDTH)

  return (
    <div className="relative hidden h-12 lg:block" style={{ width: TRACK_WIDTH }} aria-label={`Story progress ${Math.round(progress * 100)}%`} role="img">
      {/* ground */}
      <div className="absolute inset-x-0 bottom-2 h-[3px] rounded-[1px] bg-white/10" />
      <motion.div className="absolute bottom-2 left-0 h-[3px] rounded-[1px]" style={{ background: accent }} initial={false} animate={{ width: x + HERO_WIDTH / 2 }} transition={{ duration: 0.6, ease: 'easeOut' }} />
      {/* chapter checkpoints */}
      {chapterStarts.slice(1).map((c) => {
        const cx = c.at * (TRACK_WIDTH - HERO_WIDTH) + HERO_WIDTH / 2
        const reached = progress >= c.at
        const meta = chapterById(c.id)
        return (
          <span key={c.id} className="absolute bottom-[5px]" style={{ left: cx - 1 }} title={meta.label}>
            <span className="block h-2.5 w-[2px]" style={{ background: reached ? COLORS.paper : 'rgba(255,255,255,0.2)' }} />
            <span className="absolute top-0 left-[2px] block h-[5px] w-[6px]" style={{ background: reached ? meta.accent : 'rgba(255,255,255,0.15)' }} />
            {c.id === currentChapter && <span className="sr-only">current</span>}
          </span>
        )
      })}
      {/* hero */}
      <motion.div className="absolute bottom-[11px] left-0" initial={false} animate={{ x }} transition={{ duration: 0.6, ease: 'easeOut' }}>
        <PixelHero accent={accent} walking={walking} scale={2} facing={facing} />
      </motion.div>
    </div>
  )
}

function HudButton({ label, onClick, children, active = false }: { label: string; onClick: () => void; children: ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      className={cn('grid size-9 place-items-center rounded-full border border-transparent transition-colors hover:border-line hover:bg-white/[0.04] hover:text-paper', active ? 'text-paper' : 'text-dim')}
    >
      {children}
    </button>
  )
}
