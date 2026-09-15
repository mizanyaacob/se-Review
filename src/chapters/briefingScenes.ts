import { createElement } from 'react'
import { BriefingScene } from '../components/Briefing'
import { briefings, chapterById, type GoalChapterId } from '../data/selfEvaluation'
import type { SceneDef, SceneProps } from './types'

/** Builds the mission-briefing scene for a goal chapter from its data. */
export function briefingScene(chapter: GoalChapterId, id: string): SceneDef {
  const data = briefings[chapter]
  function Scene(props: SceneProps) {
    return createElement(BriefingScene, { ...props, chapterId: chapter, data })
  }
  Scene.displayName = `Briefing(${chapter})`
  return { id, chapter, title: `${chapterById(chapter).label}: mission briefing`, beats: data.blocks.length, Component: Scene }
}
