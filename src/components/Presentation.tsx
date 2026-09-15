import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { scenes, scenesPerChapter } from '../chapters'
import type { SceneDef } from '../chapters/types'
import { achievements, chapterById, type ChapterId } from '../data/selfEvaluation'
import { useIdle } from '../hooks/useIdle'
import { usePresentationNavigation } from '../hooks/usePresentationNavigation'
import { sfx } from '../lib/sfx'
import { cn } from '../lib/utils'
import { Backdrop } from './Backdrop'
import { sceneVariants } from './ChapterTransition'
import { AchievementToast } from './game/AchievementToast'
import { GameMenu, type MenuTab } from './game/GameMenu'
import { FLIGHT_MS, WarpTransition, flightKind } from './game/WarpTransition'
import { StatsOverlay } from './game/StatsOverlay'
import { useAchievements } from './game/useAchievements'
import { PresentationHUD } from './PresentationHUD'

function toggleFullscreen() {
  try {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen()
  } catch {
    /* fullscreen can be blocked by the host; the presentation still fills the viewport */
  }
}

const CHAPTER_ORDER = [...new Set(scenes.map((s) => s.chapter))]
const TOTAL_BEATS = scenes.reduce((n, s) => n + s.beats, 0)
/** Global step index at which each scene starts. */
const BEAT_OFFSET = scenes.map((_, i) => scenes.slice(0, i).reduce((n, s) => n + s.beats, 0))
const CHAPTER_STARTS = CHAPTER_ORDER.map((id) => ({ id, at: BEAT_OFFSET[scenes.findIndex((s) => s.chapter === id)] / (TOTAL_BEATS - 1) }))

export function Presentation({ initialSceneId, initialBeat, onExit }: { initialSceneId?: string; initialBeat?: number; onExit: () => void }) {
  const reduce = useReducedMotion()
  const [menu, setMenu] = useState<{ open: boolean; tab: MenuTab }>({ open: false, tab: 'quests' })
  const [stats, setStats] = useState(false)
  const [muted, setMuted] = useState(sfx.muted)
  const [fullscreen, setFullscreen] = useState(() => Boolean(document.fullscreenElement))
  const [startedAt] = useState(() => Date.now())
  const [loadedChapter, setLoadedChapter] = useState<ChapterId | null>(null)
  const idle = useIdle(2600)

  useEffect(() => {
    const unsubscribe = sfx.subscribe(setMuted)
    return () => {
      unsubscribe()
    }
  }, [])

  // Refs let the navigation interceptor read the latest overlay state without re-binding listeners.
  const menuOpenRef = useRef(false)
  menuOpenRef.current = menu.open
  const loadingRef = useRef<null | (() => void)>(null)

  const onEscape = useCallback(() => {
    if (menuOpenRef.current) setMenu((m) => ({ ...m, open: false }))
    else onExit()
  }, [onExit])
  const onToggleMenu = useCallback(() => {
    sfx.play('select')
    setMenu((m) => ({ open: !m.open, tab: m.open ? m.tab : 'quests' }))
  }, [])
  const onToggleHelp = useCallback(() => setMenu((m) => ({ open: !(m.open && m.tab === 'controls'), tab: 'controls' })), [])
  const onToggleStats = useCallback(() => setStats((s) => !s), [])
  const onToggleSound = useCallback(() => sfx.setMuted(!sfx.muted), [])
  const intercept = useCallback((input: 'forward' | 'back' | 'other') => {
    if (menuOpenRef.current) return true
    if (loadingRef.current && input === 'forward') {
      loadingRef.current()
      return true
    }
    return false
  }, [])

  const nav = usePresentationNavigation({
    scenes,
    initialSceneId,
    initialBeat,
    onEscape,
    onToggleHelp,
    onToggleFullscreen: toggleFullscreen,
    onToggleMenu,
    onToggleStats,
    onToggleSound,
    intercept,
  })
  const def = nav.def
  const chapter = chapterById(def.chapter)
  const sceneInChapter = scenes.slice(0, nav.scene).filter((s) => s.chapter === def.chapter).length

  // Loading screen whenever the story moves forward into a new chapter (and when the save file first loads).
  const chapterIdx = CHAPTER_ORDER.indexOf(def.chapter)
  const loadedIdx = loadedChapter ? CHAPTER_ORDER.indexOf(loadedChapter) : -1
  const loading = loadedChapter !== def.chapter && chapterIdx > loadedIdx
  const finishLoading = useCallback(() => setLoadedChapter(def.chapter), [def.chapter])
  loadingRef.current = loading ? finishLoading : null

  useEffect(() => {
    if (!loading) {
      if (loadedChapter !== def.chapter) setLoadedChapter(def.chapter)
      return
    }
    const t = window.setTimeout(finishLoading, reduce ? 400 : FLIGHT_MS[flightKind(def.chapter)] + 100)
    return () => window.clearTimeout(t)
  }, [loading, loadedChapter, def.chapter, finishLoading, reduce])

  const game = useAchievements(loading ? null : def.id, nav.beat, !initialSceneId || initialSceneId === scenes[0].id)

  // A soft tick on each step when sound is on.
  const stepKey = `${def.id}:${nav.beat}`
  const firstStep = useRef(true)
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false
      return
    }
    sfx.play('step')
  }, [stepKey])

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const progress = useMemo(() => (BEAT_OFFSET[nav.scene] + nav.beat) / (TOTAL_BEATS - 1), [nav.scene, nav.beat])
  const guarded = (fn: () => void, input: 'forward' | 'back') => () => {
    if (!intercept(input)) fn()
  }

  return (
    <div
      className={cn('fixed inset-0 overflow-hidden bg-ink select-none', idle && !menu.open && 'cursor-none')}
      style={{ '--accent': chapter.accent } as CSSProperties}
      role="application"
      aria-roledescription="presentation"
      aria-label={`${chapter.label}: ${def.title}`}
    >
      <Backdrop accent={chapter.accent} glowKey={def.chapter} />

      <main className="absolute inset-0">
        <AnimatePresence mode="wait" custom={nav.dir}>
          {!loading && <SceneHost key={def.id} def={def} beat={nav.beat} dir={nav.dir} accent={chapter.accent} advance={nav.advance} goToScene={nav.goToScene} />}
        </AnimatePresence>
      </main>

      <WarpTransition chapter={def.chapter} show={loading} onSkip={finishLoading} />

      <PresentationHUD
        chapter={def.chapter}
        sceneInChapter={sceneInChapter}
        scenesPerChapter={scenesPerChapter}
        beat={nav.beat}
        beats={def.beats}
        progress={progress}
        chapterStarts={CHAPTER_STARTS}
        idle={idle && !menu.open}
        fullscreen={fullscreen}
        muted={muted}
        stats={stats}
        achievementsLabel={`${game.unlocked.length}/${achievements.length}`}
        onChapter={(id) => {
          if (!menuOpenRef.current) nav.goToChapter(id)
        }}
        onPrev={guarded(nav.retreat, 'back')}
        onNext={guarded(nav.advance, 'forward')}
        onExit={onExit}
        onMenu={onToggleMenu}
        onStats={onToggleStats}
        onSound={onToggleSound}
        onFullscreen={toggleFullscreen}
      />

      <StatsOverlay
        show={stats}
        sceneId={def.id}
        step={nav.beat}
        steps={def.beats}
        chapterLabel={chapter.label}
        startedAt={startedAt}
        unlocked={game.unlocked.length}
        totalAchievements={achievements.length}
      />

      <AchievementToast achievement={game.current} unlockedCount={game.unlocked.length} onDone={game.dismiss} />

      <GameMenu
        open={menu.open}
        tab={menu.tab}
        onTab={(tab) => setMenu({ open: true, tab })}
        onClose={() => setMenu((m) => ({ ...m, open: false }))}
        currentChapter={def.chapter}
        unlocked={game.unlocked}
        onFastTravel={(id) => {
          setMenu((m) => ({ ...m, open: false }))
          nav.goToChapter(id)
        }}
      />
    </div>
  )
}

interface SceneHostProps {
  def: SceneDef
  beat: number
  dir: 1 | -1
  accent: string
  advance: () => void
  goToScene: (id: string, beat?: number) => void
}

/** Mounts one scene with its chapter's transition and remembers the beat it opened on. */
function SceneHost({ def, beat, dir, accent, advance, goToScene }: SceneHostProps) {
  const [mountBeat] = useState(beat)
  const Component = def.Component

  return (
    <motion.section className="absolute inset-0" custom={dir} variants={sceneVariants[def.chapter]} initial="initial" animate="animate" exit="exit" aria-label={def.title}>
      <Component beat={beat} mountBeat={mountBeat} accent={accent} advance={advance} goToScene={goToScene} />
    </motion.section>
  )
}
