import type { ChapterId } from '../data/selfEvaluation'
import { departmentalScenes } from './DepartmentalGoal'
import { epilogueScenes } from './FinalReflection'
import { prologueScenes } from './Opening'
import { organizationalScenes } from './OrganizationalGoal'
import { personalScenes } from './PersonalGoal'
import { retainingScenes } from './RetainingExperience'
import type { SceneDef } from './types'
import { workingScenes } from './WorkingKnowledge'

/** The whole story, in presentation order. Scene count per chapter reflects goal priority. */
export const scenes: SceneDef[] = [
  ...prologueScenes,
  ...workingScenes,
  ...retainingScenes,
  ...personalScenes,
  ...departmentalScenes,
  ...organizationalScenes,
  ...epilogueScenes,
]

export const scenesPerChapter = scenes.reduce(
  (acc, s) => {
    acc[s.chapter] = (acc[s.chapter] ?? 0) + 1
    return acc
  },
  {} as Record<ChapterId, number>,
)

export const beatsPerChapter = scenes.reduce(
  (acc, s) => {
    acc[s.chapter] = (acc[s.chapter] ?? 0) + s.beats
    return acc
  },
  {} as Record<ChapterId, number>,
)
