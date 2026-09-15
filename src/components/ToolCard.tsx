import { ArrowRight, ClipboardCheck, FolderSearch, Gamepad2, MessagesSquare, SlidersVertical, Sparkles, Table2, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { working } from '../data/selfEvaluation'
import { COLORS, cn, hexA, pad2 } from '../lib/utils'

export type Tool = (typeof working.tools)[number]

export const toolIcons: Record<string, LucideIcon> = {
  dialogue: MessagesSquare,
  input: Gamepad2,
  datatable: Table2,
  review: ClipboardCheck,
  assets: FolderSearch,
  sfx: SlidersVertical,
  vfx: Sparkles,
}

/** Small selectable tile for a tool. */
export function ToolTile({ tool, index, selected, accent, onSelect, className }: { tool: Tool; index: number; selected: boolean; accent: string; onSelect: () => void; className?: string }) {
  const Icon = toolIcons[tool.id]
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className={cn('group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-300', className)}
      style={{
        borderColor: selected ? hexA(accent, 0.6) : COLORS.line,
        background: selected ? hexA(accent, 0.1) : 'rgba(255,255,255,0.02)',
      }}
    >
      <span className="font-mono text-[0.6rem] tracking-[0.18em] text-faint">{pad2(index + 1)}</span>
      <Icon size={22} strokeWidth={1.6} style={{ color: selected ? accent : COLORS.dim }} className="transition-colors group-hover:text-paper" />
      <span className="text-[0.86rem] leading-tight font-medium text-paper/90">{tool.name}</span>
    </motion.button>
  )
}

/** Featured "TOOL UNLOCKED" card. */
export function ToolUnlockedCard({ tool, index, accent, onExplore }: { tool: Tool; index: number; accent: string; onExplore?: () => void }) {
  const Icon = toolIcons[tool.id]
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-6">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full" style={{ background: `radial-gradient(circle, ${hexA(accent, 0.22)}, transparent 70%)` }} />
      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[0.66rem] tracking-[0.22em] uppercase" style={{ color: accent }}>
          Tool unlocked
        </span>
        <span className="font-mono text-xs text-faint">
          {pad2(index + 1)} / {pad2(working.tools.length)}
        </span>
      </div>
      <div className="relative mt-5 flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl" style={{ background: hexA(accent, 0.14), color: accent }}>
          <Icon size={24} strokeWidth={1.6} />
        </span>
        <h3 className="text-[1.7rem] leading-tight font-semibold tracking-tight">{tool.name}</h3>
      </div>
      <p className="relative mt-4 text-[1.08rem] text-dim">“{tool.description}”</p>
      <div className="relative mt-6 flex items-center justify-between">
        <span className="mono-label">Area · {tool.area}</span>
        {onExplore && (
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[0.7rem] tracking-[0.16em] uppercase transition-colors hover:bg-white/5"
            style={{ borderColor: hexA(accent, 0.45), color: accent }}
          >
            Explore <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
