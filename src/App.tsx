import { MotionConfig } from 'motion/react'
import { useCallback, useState } from 'react'
import { GoalOverview } from './components/GoalOverview'
import { Presentation } from './components/Presentation'

type Mode = { name: 'overview' } | { name: 'present'; sceneId?: string; beat?: number }

/** #/present/<scene-id>/<beat> opens presentation mode at that exact step. */
function modeFromHash(): Mode {
  const match = window.location.hash.match(/^#\/present(?:\/([\w-]+))?(?:\/(\d+))?/)
  return match ? { name: 'present', sceneId: match[1], beat: match[2] ? Number(match[2]) : 0 } : { name: 'overview' }
}

export default function App() {
  const [mode, setMode] = useState<Mode>(modeFromHash)

  const start = useCallback((sceneId?: string) => {
    try {
      if (!document.fullscreenElement) void document.documentElement.requestFullscreen().catch(() => undefined)
    } catch {
      /* not available in every host */
    }
    window.scrollTo(0, 0)
    setMode({ name: 'present', sceneId })
  }, [])

  const exit = useCallback(() => {
    try {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
      history.replaceState(null, '', window.location.pathname + window.location.search)
    } catch {
      /* ignore */
    }
    setMode({ name: 'overview' })
    requestAnimationFrame(() => document.getElementById('overview')?.scrollIntoView())
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      {mode.name === 'present' ? <Presentation initialSceneId={mode.sceneId} initialBeat={mode.beat} onExit={exit} /> : <GoalOverview onStart={start} />}
    </MotionConfig>
  )
}
