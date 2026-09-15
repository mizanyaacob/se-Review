import { motion } from 'motion/react'
import { Fragment } from 'react'
import { COLORS, cn, hexA } from '../lib/utils'

interface TimelineProps {
  items: string[]
  /** How many items are lit, from the start. */
  lit: number
  accent: string
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/** A chain of labelled nodes whose connectors fill as the story progresses. */
export function Timeline({ items, lit, accent, orientation = 'horizontal', size = 'md', className }: TimelineProps) {
  const vertical = orientation === 'vertical'
  const pill = {
    sm: 'px-3 py-1.5 text-[0.66rem]',
    md: 'px-4 py-2 text-[0.74rem]',
    lg: 'px-5 py-3 text-[0.86rem]',
  }[size]

  return (
    <ol className={cn('flex', vertical ? 'flex-col items-start' : 'w-full items-center', className)}>
      {items.map((item, i) => {
        const on = i < lit
        const current = i === lit - 1
        return (
          <Fragment key={item}>
            <li className="relative shrink-0">
              <motion.span
                className={cn('relative block rounded-full border font-mono tracking-[0.12em] whitespace-nowrap uppercase', pill)}
                initial={false}
                animate={
                  on
                    ? { borderColor: hexA(accent, 0.75), color: COLORS.paper, backgroundColor: hexA(accent, 0.12) }
                    : { borderColor: 'rgba(255,255,255,0.1)', color: COLORS.faint, backgroundColor: 'rgba(255,255,255,0)' }
                }
                transition={{ duration: 0.45 }}
              >
                {current && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: `0 0 0 1px ${accent}` }}
                    animate={{ opacity: [0.9, 0], scale: [1, 1.18] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                {item}
              </motion.span>
            </li>
            {i < items.length - 1 && (
              <li aria-hidden className={cn('relative overflow-hidden bg-white/[0.08]', vertical ? 'my-1 ml-6 h-6 w-px' : 'mx-2 h-px min-w-4 flex-1')}>
                <motion.span
                  className={cn('absolute inset-0', vertical ? 'origin-top' : 'origin-left')}
                  style={{ background: accent }}
                  initial={false}
                  animate={vertical ? { scaleY: i < lit - 1 ? 1 : 0 } : { scaleX: i < lit - 1 ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </li>
            )}
          </Fragment>
        )
      })}
    </ol>
  )
}
