import type { ComponentType } from 'react'
import type { ChapterId } from '../data/selfEvaluation'

export interface SceneProps {
  /** Current animation beat inside the scene (Space advances it). */
  beat: number
  /** Beat the scene was mounted at. >0 means we arrived by going backwards, so skip replays. */
  mountBeat: number
  accent: string
  advance: () => void
  goToScene: (id: string, beat?: number) => void
}

export interface SceneDef {
  id: string
  chapter: ChapterId
  title: string
  /** Number of Space presses the scene consumes before moving on (min 1). */
  beats: number
  Component: ComponentType<SceneProps>
}
