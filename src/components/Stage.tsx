import type { ReactNode } from 'react'
import { cn } from '../lib/utils'
import { Reveal } from './Reveal'

/** Full-viewport content frame that leaves room for the HUD above and below. */
export function Stage({ children, className, wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return (
    <div
      className={cn(
        'relative mx-auto flex h-full w-full flex-col justify-center px-8 pt-20 pb-20 md:px-14',
        wide ? 'max-w-[1400px]' : 'max-w-[1240px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Kicker({ children, accent, className }: { children: ReactNode; accent?: string; className?: string }) {
  return (
    <p className={cn('mono-label', className)} style={accent ? { color: accent } : undefined}>
      {children}
    </p>
  )
}

/** Kicker + headline pair used at the top of most scenes. */
export function SceneTitle({ kicker, title, accent, className, size = 'md' }: { kicker: string; title: ReactNode; accent?: string; className?: string; size?: 'md' | 'lg' }) {
  return (
    <div className={className}>
      <Reveal>
        <Kicker accent={accent}>{kicker}</Kicker>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className={cn('display mt-4', size === 'lg' ? 'text-[clamp(2.8rem,5vw,5.2rem)]' : 'text-[clamp(2.2rem,3.6vw,3.6rem)]')}>{title}</h2>
      </Reveal>
    </div>
  )
}
