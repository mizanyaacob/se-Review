import { motion } from 'motion/react'
import { useEffect } from 'react'
import type { FourQuestions as FourQuestionsData, QuestStatus } from '../data/selfEvaluation'
import { sfx } from '../lib/sfx'
import { COLORS, hexA, pad2 } from '../lib/utils'
import { Reveal } from './Reveal'
import { Kicker, Stage } from './Stage'

const LABELS = ['What I wanted', 'What happened', 'What I did', 'What changed'] as const

interface Props {
  data: FourQuestionsData
  beat: number
  accent: string
  chapterTitle: string
  status: QuestStatus
  /** Lower-priority chapters reveal all four answers in one beat. */
  allAtOnce?: boolean
}

/** The storytelling frame every chapter answers: wanted → happened → did → changed. Ends with a "chapter clear" stamp. */
export function FourQuestions({ data, beat, accent, chapterTitle, status, allAtOnce = false }: Props) {
  const answers = [data.wanted, data.happened, data.did, data.changed]
  const cleared = allAtOnce || beat >= answers.length - 1
  const statusColor = status === 'Ongoing' ? COLORS.warn : COLORS.ok

  useEffect(() => {
    if (!cleared) return
    const t = window.setTimeout(() => sfx.play('clear'), allAtOnce ? 900 : 500)
    return () => window.clearTimeout(t)
  }, [cleared, allAtOnce])

  return (
    <Stage wide>
      <div className="flex items-start justify-between gap-8">
        <div>
          <Reveal>
            <Kicker accent={accent}>Chapter recap</Kicker>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display mt-4 text-[clamp(2.4rem,4.2vw,4.4rem)]">{chapterTitle}</h2>
          </Reveal>
        </div>

        {cleared && (
          <motion.div
            className="relative shrink-0 rounded-lg border-2 px-5 py-3 text-center"
            style={{ borderColor: statusColor, color: statusColor, boxShadow: `0 0 40px -10px ${hexA(statusColor, 0.6)}` }}
            initial={{ opacity: 0, scale: 1.8, rotate: -14 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: allAtOnce ? 0.8 : 0.4 }}
            role="status"
          >
            <span className="font-pixel block text-[24px] leading-none tracking-[2px] uppercase">Chapter clear</span>
            <span className="mt-2 block font-mono text-[0.66rem] tracking-[0.2em] uppercase opacity-80">Quest · {status}</span>
          </motion.div>
        )}
      </div>

      <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {answers.map((answer, i) => (
          <Reveal as="li" key={LABELS[i]} show={allAtOnce || beat >= i} delay={allAtOnce ? 0.2 + i * 0.12 : 0.05} y={24}>
            <article className="glass flex h-full min-h-[250px] flex-col rounded-2xl p-7">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: accent }}>
                  {pad2(i + 1)}
                </span>
                <span className="h-px flex-1" style={{ background: hexA(accent, 0.25) }} />
              </div>
              <p className="mono-label mt-5">{LABELS[i]}</p>
              <p className="mt-auto pt-8 text-[clamp(1.25rem,1.6vw,1.6rem)] leading-snug font-medium tracking-tight">{answer}</p>
            </article>
          </Reveal>
        ))}
      </ol>
    </Stage>
  )
}
