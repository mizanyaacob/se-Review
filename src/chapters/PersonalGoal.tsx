import { ChapterIntro } from '../components/ChapterIntro'
import { FourQuestions } from '../components/FourQuestions'
import { MountainProgress } from '../components/MountainProgress'
import { chapterById, personal, quests } from '../data/selfEvaluation'
import { briefingScene } from './briefingScenes'
import type { SceneDef, SceneProps } from './types'

function IntroScene(props: SceneProps) {
  return (
    <ChapterIntro
      {...props}
      chapterId="personal"
      lines={['An engineer is still a person.']}
      titleLines={['Getting Back', 'Outdoors']}
      wanted={[personal.goal, 'Start hiking again this year']}
      target={`One hike of ${personal.targetMeters}m+`}
    />
  )
}

function RecapScene({ beat, accent }: SceneProps) {
  return <FourQuestions data={personal.recap} beat={beat} accent={accent} chapterTitle={chapterById('personal').title} status={quests.personal.status} allAtOnce />
}

// Deliberately short: this chapter is about balance, not volume.
export const personalScenes: SceneDef[] = [
  { id: 'pg-intro', chapter: 'personal', title: 'Getting back outdoors', beats: 3, Component: IntroScene },
  briefingScene('personal', 'pg-briefing'),
  { id: 'pg-climb', chapter: 'personal', title: 'Mount Alai', beats: 4, Component: MountainProgress },
  { id: 'pg-recap', chapter: 'personal', title: 'Recap', beats: 1, Component: RecapScene },
]
