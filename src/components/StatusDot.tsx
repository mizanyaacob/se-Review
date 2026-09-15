import { cn } from '../lib/utils'

export function StatusDot({ label, color, pulse = false, className }: { label: string; color: string; pulse?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.16em] uppercase', className)} style={{ color }}>
      <span className="relative flex size-2">
        {pulse && <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: color }} />}
        <span className="relative size-2 rounded-full" style={{ background: color }} />
      </span>
      {label}
    </span>
  )
}
