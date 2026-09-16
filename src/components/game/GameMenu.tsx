import { ArrowRight, CircleCheck, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { achievements, chapterById, glance, quests, type ChapterId, type GoalChapterId, type QuestStatus } from '../../data/selfEvaluation'
import { sfx } from '../../lib/sfx'
import { COLORS, EASE_OUT, cn, hexA, pad2 } from '../../lib/utils'
import { AchievementBadge } from './AchievementBadge'
import { SHORTCUTS } from './shortcuts'

export type MenuTab = 'quests' | 'achievements' | 'controls'

const QUEST_ORDER: Array<keyof typeof quests> = ['working', 'retaining', 'personal', 'departmental', 'organizational']

const STATUS_COLOR: Record<QuestStatus, string> = {
  Ongoing: COLORS.warn,
  Complete: COLORS.ok,
  Exceeded: COLORS.ok,
}

interface GameMenuProps {
  open: boolean
  tab: MenuTab
  onTab: (tab: MenuTab) => void
  onClose: () => void
  currentChapter: ChapterId
  unlocked: string[]
  onFastTravel: (chapter: ChapterId) => void
}

/** Pause-menu style overlay: quest log, achievements and controls. */
export function GameMenu({ open, tab, onTab, onClose, currentChapter, unlocked, onFastTravel }: GameMenuProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const firstQuest = (QUEST_ORDER as ChapterId[]).includes(currentChapter) ? (currentChapter as keyof typeof quests) : 'working'
  const [selected, setSelected] = useState<keyof typeof quests>(firstQuest)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    setSelected(firstQuest)
  }, [open, firstQuest])

  const tabs: Array<[MenuTab, string]> = [
    ['quests', 'Quest log'],
    ['achievements', `Achievements ${unlocked.length}/${achievements.length}`],
    ['controls', 'Controls'],
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-[60] grid place-items-center bg-black/70 p-6 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Game menu"
            className="glass flex h-[min(760px,88vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl"
            initial={{ y: 24, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
              <nav className="flex gap-1" aria-label="Menu tabs">
                {tabs.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      sfx.play('select')
                      onTab(id)
                    }}
                    aria-pressed={tab === id}
                    className={cn('font-pixel rounded-md px-4 py-2 text-[16px] tracking-[1px] uppercase transition-colors', tab === id ? 'bg-white/10 text-paper' : 'text-faint hover:text-dim')}
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close menu" className="grid size-9 place-items-center rounded-full text-dim hover:bg-white/5 hover:text-paper">
                <X size={18} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {tab === 'quests' && (
                <div className="grid h-full grid-cols-[300px_1fr]">
                  <ol className="space-y-1 border-r border-line p-3">
                    {QUEST_ORDER.map((id, i) => {
                      const meta = chapterById(id)
                      const q = quests[id]
                      const active = selected === id
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => {
                              sfx.play('select')
                              setSelected(id)
                            }}
                            className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors', active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.03]')}
                          >
                            <span className="w-6 font-mono text-[0.8rem]" style={{ color: meta.accent }}>
                              {pad2(i + 1)}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[1rem] font-medium">{meta.label}</span>
                              <span className="block font-mono text-[0.62rem] tracking-[0.18em] uppercase" style={{ color: STATUS_COLOR[q.status] }}>
                                {q.status}
                              </span>
                            </span>
                            {currentChapter === id && <span className="size-1.5 rounded-full" style={{ background: meta.accent }} title="You are here" />}
                          </button>
                        </li>
                      )
                    })}
                  </ol>

                  <AnimatePresence mode="wait">
                    <motion.section key={selected} className="flex flex-col p-8" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.25 }}>
                      <QuestDetail id={selected} unlocked={unlocked} onFastTravel={() => onFastTravel(selected)} />
                    </motion.section>
                  </AnimatePresence>
                </div>
              )}

              {tab === 'achievements' && (
                <ul className="grid grid-cols-2 gap-3 p-6">
                  {achievements.map((a) => {
                    const got = unlocked.includes(a.id)
                    const accent = chapterById(a.chapter).accent
                    return (
                      <li key={a.id} className={cn('flex items-center gap-4 rounded-xl border p-4', got ? 'border-line-2 bg-white/[0.03]' : 'border-line')}>
                        <AchievementBadge icon={a.icon} accent={accent} size={48} locked={!got} />
                        <div className="min-w-0">
                          <p className={cn('text-[1rem] font-semibold tracking-tight', !got && 'text-faint')}>{got ? a.title : 'Locked'}</p>
                          <p className="text-[0.86rem] leading-snug text-dim">{got ? a.description : `Found in ${chapterById(a.chapter).label}`}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              {tab === 'controls' && (
                <dl className="mx-auto max-w-2xl divide-y divide-line p-6">
                  {SHORTCUTS.map(([keys, action]) => (
                    <div key={action} className="flex items-center justify-between gap-6 py-3">
                      <dt className="flex flex-wrap gap-1.5">
                        {keys.map((k) => (
                          <span key={k} className="kbd">
                            {k}
                          </span>
                        ))}
                      </dt>
                      <dd className="text-right text-[0.98rem] text-dim">{action}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function QuestDetail({ id, unlocked, onFastTravel }: { id: keyof typeof quests; unlocked: string[]; onFastTravel: () => void }) {
  const meta = chapterById(id)
  const q = quests[id]
  const g = glance[id as GoalChapterId]
  const rewards = achievements.filter((a) => a.chapter === id)

  return (
    <>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="font-mono text-[0.7rem] tracking-[0.18em] uppercase" style={{ color: meta.accent }}>
            Goal {pad2(meta.goal ?? 0)} · Priority {meta.goal}
          </p>
          <h3 className="mt-2 text-[2rem] leading-tight font-semibold tracking-tight">{meta.title}</h3>
        </div>
        <span className="font-pixel shrink-0 rounded-md border px-3 py-1.5 text-[16px] tracking-[1px] uppercase" style={{ borderColor: hexA(STATUS_COLOR[q.status], 0.5), color: STATUS_COLOR[q.status] }}>
          {q.status}
        </span>
      </div>

      <p className="mono-label mt-6">Objective</p>
      <p className="mt-2 max-w-[60ch] text-[1.05rem] text-dim">{q.objective}</p>

      {/* the target, horizon and measure as written in the review */}
      <dl className="mt-4 grid gap-x-7 gap-y-3 rounded-xl border border-line p-4 sm:grid-cols-3">
        <div>
          <dt className="mono-label">Target set</dt>
          <dd className="mt-1 text-[0.94rem] leading-snug text-dim">{g.target}</dd>
        </div>
        {g.timeline && (
          <div>
            <dt className="mono-label">Timeline</dt>
            <dd className="mt-1 text-[0.94rem] leading-snug text-dim">{g.timeline}</dd>
          </div>
        )}
        {g.tracking && (
          <div>
            <dt className="mono-label">How I tracked it</dt>
            <dd className="mt-1 text-[0.94rem] leading-snug text-dim">{g.tracking}</dd>
          </div>
        )}
      </dl>

      <p className="mono-label mt-6">Result</p>
      <ul className="mt-3 space-y-2">
        {q.result.map((r) => (
          <li key={r} className="flex items-center gap-3 text-[1.05rem]">
            <CircleCheck size={16} style={{ color: COLORS.ok }} className="shrink-0" />
            {r}
          </li>
        ))}
      </ul>

      <p className="mono-label mt-6">Rewards</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {rewards.map((a) => (
          <span key={a.id} className={cn('rounded-full border px-3 py-1 text-[0.86rem]', unlocked.includes(a.id) ? 'border-line-2 text-paper' : 'border-line text-faint')}>
            {unlocked.includes(a.id) ? a.title : '???'}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onFastTravel}
        className="mt-auto inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 font-mono text-[0.72rem] font-semibold tracking-[0.16em] text-ink uppercase transition-transform hover:scale-[1.03]"
        style={{ background: meta.accent }}
      >
        Fast travel <ArrowRight size={14} />
      </button>
    </>
  )
}
