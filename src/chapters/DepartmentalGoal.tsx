import { motion } from 'motion/react'
import { ChapterIntro } from '../components/ChapterIntro'
import { DevOpsPipeline } from '../components/DevOpsPipeline'
import { FourQuestions } from '../components/FourQuestions'
import { MetricCounter } from '../components/MetricCounter'
import { Reveal } from '../components/Reveal'
import { Kicker, SceneTitle, Stage } from '../components/Stage'
import { StatusDot } from '../components/StatusDot'
import { Timeline } from '../components/Timeline'
import { chapterById, departmental, quests } from '../data/selfEvaluation'
import { useSteppedValue } from '../hooks/useSteppedValue'
import { COLORS } from '../lib/utils'
import { briefingScene } from './briefingScenes'
import type { SceneDef, SceneProps } from './types'

function IntroScene(props: SceneProps) {
  return (
    <ChapterIntro
      {...props}
      chapterId="departmental"
      lines={['Then I started asking a different question.', 'What happens outside the game?']}
      titleLines={['Learning DevOps', 'from the Ground Up']}
      wanted={['Understand DevOps processes and tools', 'Be able to assist the DevOps team when needed']}
      target="General understanding within the year"
    />
  )
}

/* Floating confusion → a clear chain -------------------------------- */

const TERM_POSITIONS = [
  { left: '6%', top: '14%' },
  { left: '52%', top: '4%' },
  { left: '30%', top: '58%' },
]

function TermsScene({ beat, mountBeat, accent }: SceneProps) {
  const clear = beat >= 1
  const lit = useSteppedValue(clear ? departmental.flow.length : 0, 420, mountBeat >= 1)

  return (
    <Stage wide>
      <Reveal>
        <Kicker accent={accent}>Departmental · Where it started</Kicker>
      </Reveal>

      <div className="relative mt-6 h-[52vh]">
        {departmental.confusingTerms.map((term, i) => (
          <motion.p
            key={term}
            className="display absolute text-[clamp(3.2rem,6.6vw,6.8rem)]"
            style={TERM_POSITIONS[i]}
            initial={{ opacity: 0, y: 20 }}
            animate={clear ? { opacity: 0.06, y: 0, scale: 0.94, filter: 'blur(5px)' } : { opacity: 1, y: [0, -16, 0], scale: 1, filter: 'blur(0px)' }}
            transition={
              clear
                ? { duration: 0.7 }
                : { opacity: { duration: 0.9, delay: 0.2 + i * 0.35 }, y: { duration: 4.5 + i, repeat: Infinity, ease: 'easeInOut' }, filter: { duration: 0.5 } }
            }
          >
            {term}
          </motion.p>
        ))}

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <Reveal show={clear} delay={0.3}>
            <Timeline items={departmental.flow} lit={lit} accent={accent} size="lg" />
          </Reveal>
          <Reveal show={clear && lit === departmental.flow.length} delay={0.3} className="mt-10">
            <p className="text-center text-[clamp(1.4rem,2.2vw,2rem)] font-medium tracking-tight">
              A simple question turned into <span style={{ color: accent }}>an automated build.</span>
            </p>
          </Reveal>
        </div>
      </div>
    </Stage>
  )
}

/* Results + positioning --------------------------------------------- */

function ResultsScene({ beat, accent }: SceneProps) {
  return (
    <Stage wide>
      <SceneTitle kicker="Departmental · Result" title="What the pipeline gave me" accent={accent} />

      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {departmental.metrics.map((m, i) => (
          <Reveal as="li" key={m.label} delay={0.15 + i * 0.12} y={26}>
            <div className="glass flex h-full flex-col justify-between gap-10 rounded-2xl p-8">
              <p className="display text-[clamp(4rem,7vw,6.6rem)] leading-none tabular-nums" style={{ color: i === 0 ? accent : COLORS.paper }}>
                {m.display === 'LIVE' ? (
                  <span className="inline-flex items-center gap-4">
                    <span className="relative flex size-4">
                      <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: COLORS.ok }} />
                      <span className="relative size-4 rounded-full" style={{ background: COLORS.ok }} />
                    </span>
                    LIVE
                  </span>
                ) : /^\d+$/.test(m.display) ? (
                  <MetricCounter value={Number(m.display)} duration={1} delay={0.3} />
                ) : (
                  m.display
                )}
              </p>
              <p className="font-mono text-[0.76rem] tracking-[0.2em] uppercase">{m.label}</p>
            </div>
          </Reveal>
        ))}
      </ul>

      <div className="mt-6">
        <Reveal delay={0.6}>
          <StatusDot label="BKT automated build · still working today" color={COLORS.ok} pulse />
        </Reveal>
      </div>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal show={beat >= 1} blur>
          <p className="display max-w-[24ch] text-[clamp(2.1rem,3.5vw,3.6rem)]">
            I became an engineer who understands more of <span style={{ color: accent }}>the pipeline around the code I write.</span>
          </p>
        </Reveal>
        <ul className="space-y-3">
          {departmental.outcomes.map((o, i) => (
            <Reveal as="li" key={o} show={beat >= 1} delay={0.25 + i * 0.18} x={20} y={0}>
              <span className="flex gap-3 text-[clamp(1.02rem,1.35vw,1.22rem)] leading-snug text-dim">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                {o}
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </Stage>
  )
}

function RecapScene({ beat, accent }: SceneProps) {
  return <FourQuestions data={departmental.recap} beat={beat} accent={accent} chapterTitle={chapterById('departmental').title} status={quests.departmental.status} allAtOnce />
}

export const departmentalScenes: SceneDef[] = [
  { id: 'dg-intro', chapter: 'departmental', title: 'Learning DevOps', beats: 4, Component: IntroScene },
  briefingScene('departmental', 'dg-briefing'),
  { id: 'dg-terms', chapter: 'departmental', title: 'Build agent? Pipeline? Automation?', beats: 2, Component: TermsScene },
  { id: 'dg-pipeline', chapter: 'departmental', title: 'The BKT pipeline', beats: 4, Component: DevOpsPipeline },
  { id: 'dg-results', chapter: 'departmental', title: 'Result', beats: 2, Component: ResultsScene },
  { id: 'dg-recap', chapter: 'departmental', title: 'Recap', beats: 1, Component: RecapScene },
]
