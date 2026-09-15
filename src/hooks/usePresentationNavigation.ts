import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SceneDef } from '../chapters/types'
import type { ChapterId } from '../data/selfEvaluation'

export interface NavState {
  scene: number
  beat: number
  dir: 1 | -1
}

interface Options {
  scenes: SceneDef[]
  initialSceneId?: string
  initialBeat?: number
  onEscape: () => void
  onToggleHelp: () => void
  onToggleFullscreen: () => void
  onToggleMenu: () => void
  onToggleStats: () => void
  onToggleSound: () => void
  /**
   * Called before any navigation input. Return true to swallow it
   * (e.g. an open menu, or Space skipping a loading screen).
   */
  intercept?: (input: 'forward' | 'back' | 'other') => boolean
}

/**
 * Keyboard / wheel / touch driver for presentation mode.
 *
 *   Space, Enter, PageDown, ↓, wheel, swipe   advance one beat (then the next scene)
 *   Backspace, PageUp, ↑                      step back one beat
 *   → / ←                                     next / previous scene
 *   Shift + → / ←                             next / previous chapter
 *   0–6                                       jump to chapter (1–5 are the goals)
 *   Q / G / M / F / ?                         quest log · stats · sound · fullscreen · controls
 *   Esc                                       back to overview
 */
export function usePresentationNavigation({ scenes, initialSceneId, initialBeat = 0, onEscape, onToggleHelp, onToggleFullscreen, onToggleMenu, onToggleStats, onToggleSound, intercept }: Options) {
  const [state, setState] = useState<NavState>(() => {
    const i = Math.max(0, initialSceneId ? scenes.findIndex((s) => s.id === initialSceneId) : 0)
    return { scene: i, beat: Math.min(Math.max(0, initialBeat), scenes[i].beats - 1), dir: 1 }
  })

  const chapterOrder = useMemo(() => {
    const order: ChapterId[] = []
    scenes.forEach((s) => {
      if (!order.includes(s.chapter)) order.push(s.chapter)
    })
    return order
  }, [scenes])

  const advance = useCallback(() => {
    setState((s) => {
      if (s.beat < scenes[s.scene].beats - 1) return { ...s, beat: s.beat + 1, dir: 1 }
      if (s.scene < scenes.length - 1) return { scene: s.scene + 1, beat: 0, dir: 1 }
      return s
    })
  }, [scenes])

  const retreat = useCallback(() => {
    setState((s) => {
      if (s.beat > 0) return { ...s, beat: s.beat - 1, dir: -1 }
      if (s.scene > 0) return { scene: s.scene - 1, beat: scenes[s.scene - 1].beats - 1, dir: -1 }
      return s
    })
  }, [scenes])

  const nextScene = useCallback(() => {
    setState((s) => (s.scene < scenes.length - 1 ? { scene: s.scene + 1, beat: 0, dir: 1 } : s))
  }, [scenes])

  // Going back lands on the previous scene fully revealed, so nothing replays.
  const prevScene = useCallback(() => {
    setState((s) => (s.scene > 0 ? { scene: s.scene - 1, beat: scenes[s.scene - 1].beats - 1, dir: -1 } : s))
  }, [scenes])

  const goToScene = useCallback(
    (id: string, beat = 0) => {
      const i = scenes.findIndex((s) => s.id === id)
      if (i < 0) return
      setState((s) => ({ scene: i, beat: Math.min(beat, scenes[i].beats - 1), dir: i >= s.scene ? 1 : -1 }))
    },
    [scenes],
  )

  const goToChapter = useCallback(
    (chapter: ChapterId) => {
      const i = scenes.findIndex((s) => s.chapter === chapter)
      if (i < 0) return
      setState((s) => ({ scene: i, beat: 0, dir: i >= s.scene ? 1 : -1 }))
    },
    [scenes],
  )

  const stepChapter = useCallback(
    (delta: 1 | -1) => {
      setState((s) => {
        const current = chapterOrder.indexOf(scenes[s.scene].chapter)
        const target = chapterOrder[current + delta]
        if (!target) return s
        const i = scenes.findIndex((sc) => sc.chapter === target)
        return { scene: i, beat: 0, dir: delta }
      })
    },
    [chapterOrder, scenes],
  )

  // Remember whether the user is navigating with Tab, so Space on a focused
  // button activates it only for keyboard users; after a mouse click Space advances.
  const keyboardFocus = useRef(false)

  useEffect(() => {
    const onPointer = () => {
      keyboardFocus.current = false
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') keyboardFocus.current = true
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      const onControl = Boolean(target?.closest('button, a, [role="button"]')) && keyboardFocus.current

      // Overlay toggles work at any time, even while a menu is open.
      switch (e.key) {
        case 'Escape':
          onEscape()
          return
        case 'q':
        case 'Q':
          e.preventDefault()
          onToggleMenu()
          return
        case '?':
        case 'h':
        case 'H':
          onToggleHelp()
          return
        case 'g':
        case 'G':
        case '`':
          onToggleStats()
          return
        case 'm':
        case 'M':
          onToggleSound()
          return
        case 'f':
        case 'F':
          onToggleFullscreen()
          return
      }

      if ((e.key === ' ' || e.key === 'Enter') && onControl) return
      const input = [' ', 'Enter', 'PageDown', 'ArrowDown', 'ArrowRight'].includes(e.key) ? 'forward' : ['PageUp', 'ArrowUp', 'Backspace', 'ArrowLeft'].includes(e.key) ? 'back' : 'other'
      if (intercept?.(input)) {
        if (input !== 'other') e.preventDefault()
        return
      }

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault()
          advance()
          break
        case 'PageDown':
        case 'ArrowDown':
          e.preventDefault()
          advance()
          break
        case 'PageUp':
        case 'ArrowUp':
        case 'Backspace':
          e.preventDefault()
          retreat()
          break
        case 'ArrowRight':
          e.preventDefault()
          if (e.shiftKey) stepChapter(1)
          else nextScene()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (e.shiftKey) stepChapter(-1)
          else prevScene()
          break
        case 'Home':
          e.preventDefault()
          setState({ scene: 0, beat: 0, dir: -1 })
          break
        case 'End':
          e.preventDefault()
          setState({ scene: scenes.length - 1, beat: 0, dir: 1 })
          break
        default:
          if (/^[0-6]$/.test(e.key)) {
            const chapter = chapterOrder[Number(e.key)]
            if (chapter) goToChapter(chapter)
          }
      }
    }

    // One step per wheel gesture: a gesture ends after 180ms of silence.
    let lastWheel = 0
    let acc = 0
    let consumed = false
    const onWheel = (e: WheelEvent) => {
      const now = performance.now()
      if (now - lastWheel > 180) {
        acc = 0
        consumed = false
      }
      lastWheel = now
      if (consumed) return
      acc += e.deltaY
      if (Math.abs(acc) > 40) {
        consumed = true
        if (intercept?.(acc > 0 ? 'forward' : 'back')) return
        if (acc > 0) advance()
        else retreat()
      }
    }

    let touchX = 0
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchX = e.touches[0].clientX
      touchY = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchX
      const dy = e.changedTouches[0].clientY - touchY
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return
      if (intercept?.(dx < 0 ? 'forward' : 'back')) return
      if (dx < 0) advance()
      else retreat()
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [advance, retreat, nextScene, prevScene, stepChapter, goToChapter, chapterOrder, scenes.length, onEscape, onToggleHelp, onToggleFullscreen, onToggleMenu, onToggleStats, onToggleSound, intercept])

  // Keep the URL in sync so a refresh during rehearsal lands on the same scene and step.
  const sceneId = scenes[state.scene].id
  useEffect(() => {
    try {
      history.replaceState(null, '', `#/present/${sceneId}${state.beat > 0 ? `/${state.beat}` : ''}`)
    } catch {
      /* sandboxed hosts may block history access */
    }
  }, [sceneId, state.beat])

  return { ...state, def: scenes[state.scene], chapterOrder, advance, retreat, nextScene, prevScene, goToScene, goToChapter }
}
