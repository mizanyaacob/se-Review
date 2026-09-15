import { useCallback, useEffect, useRef, useState } from 'react'
import { achievements, type Achievement } from '../../data/selfEvaluation'
import { sfx } from '../../lib/sfx'

const STORAGE_KEY = 'se-review:achievements'

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

/**
 * Unlocks achievements as the presenter reaches their trigger step, with a short
 * delay so the scene's own animation lands first. Leaving the scene early unlocks
 * silently instead of popping a toast over the next scene.
 */
export function useAchievements(sceneId: string | null, beat: number, resetOnMount: boolean) {
  const [unlocked, setUnlocked] = useState<string[]>(() => (resetOnMount ? [] : load()))
  const [queue, setQueue] = useState<Achievement[]>([])
  const pending = useRef(new Map<string, { timer: number; scene: string }>())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
    } catch {
      /* storage can be blocked */
    }
  }, [unlocked])

  useEffect(() => {
    // Timers for a scene we already left: record the unlock without a toast.
    const left: string[] = []
    pending.current.forEach((p, id) => {
      if (p.scene !== sceneId) {
        window.clearTimeout(p.timer)
        pending.current.delete(id)
        left.push(id)
      }
    })
    if (left.length) setUnlocked((u) => [...u, ...left.filter((id) => !u.includes(id))])
    if (!sceneId) return

    achievements
      .filter((a) => a.trigger.scene === sceneId && beat >= a.trigger.beat && !unlocked.includes(a.id) && !pending.current.has(a.id))
      .forEach((a) => {
        const timer = window.setTimeout(() => {
          pending.current.delete(a.id)
          setUnlocked((u) => (u.includes(a.id) ? u : [...u, a.id]))
          setQueue((q) => [...q, a])
          sfx.play('unlock')
        }, a.delayMs)
        pending.current.set(a.id, { timer, scene: sceneId })
      })
  }, [sceneId, beat, unlocked])

  useEffect(() => {
    const map = pending.current
    return () => {
      map.forEach((p) => window.clearTimeout(p.timer))
      map.clear()
    }
  }, [])

  const dismiss = useCallback(() => setQueue((q) => q.slice(1)), [])

  return { unlocked, current: queue[0] ?? null, dismiss }
}
