import { MousePointerClick } from 'lucide-react'
import { motion } from 'motion/react'
import { retaining } from '../data/selfEvaluation'
import { EASE_OUT, hexA, pad2 } from '../lib/utils'

type Session = (typeof retaining.sessions)[number]

/** An Engineers Weekly session as a slide that flips over to reveal its topic. */
export function KnowledgeCard({ session, index, revealed, accent, onToggle }: { session: Session; index: number; revealed: boolean; accent: string; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={revealed}
      aria-label={`Engineers Weekly session ${index + 1}${revealed ? `: ${session.title}` : ''}`}
      whileHover={{ y: -4 }}
      className="relative aspect-[16/10] w-full text-left [perspective:1600px]"
    >
      <motion.span
        className="relative block size-full [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.85, ease: EASE_OUT }}
      >
        {/* front: title slide placeholder */}
        <span className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-line bg-ink-2 p-6 [backface-visibility:hidden]">
          <span className="flex items-center justify-between">
            <span className="mono-label">Engineers Weekly</span>
            <span className="flex gap-1.5">
              <span className="size-1.5 rounded-full bg-white/15" />
              <span className="size-1.5 rounded-full bg-white/15" />
              <span className="size-1.5 rounded-full bg-white/15" />
            </span>
          </span>
          <span className="text-[clamp(4rem,7vw,6.5rem)] leading-none font-semibold tracking-tighter text-transparent" style={{ WebkitTextStroke: `1px ${hexA(accent, 0.45)}` }}>
            {pad2(index + 1)}
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.16em] text-faint uppercase">
            <MousePointerClick size={14} /> Reveal topic
          </span>
        </span>

        {/* back: the topic */}
        <span
          className="absolute inset-0 flex flex-col rounded-2xl border p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ borderColor: hexA(accent, 0.4), background: `linear-gradient(155deg, ${hexA(accent, 0.18)}, #101013 62%)` }}
        >
          <span className="flex items-center justify-between">
            <span className="font-mono text-[0.66rem] tracking-[0.2em] uppercase" style={{ color: accent }}>
              Session {pad2(index + 1)}
            </span>
            <span className="rounded-full border border-line-2 px-2.5 py-0.5 font-mono text-[0.6rem] tracking-[0.16em] text-dim uppercase">{session.kind}</span>
          </span>
          <span className="mt-auto block text-[clamp(1.45rem,2vw,1.9rem)] leading-tight font-semibold tracking-tight">{session.title}</span>
          <span className="mt-3 block text-[0.98rem] leading-snug text-dim">{session.summary}</span>
        </span>
      </motion.span>
    </motion.button>
  )
}
