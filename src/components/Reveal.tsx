import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { EASE_OUT } from '../lib/utils'

const tags = { div: motion.div, span: motion.span, p: motion.p, li: motion.li }

interface RevealProps {
  /** Beat-driven visibility. Hidden content keeps its layout space so nothing jumps. */
  show?: boolean
  delay?: number
  y?: number
  x?: number
  blur?: boolean
  duration?: number
  as?: keyof typeof tags
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export function Reveal({ show = true, delay = 0, y = 18, x = 0, blur = false, duration = 0.8, as = 'div', className, style, children }: RevealProps) {
  const Comp = tags[as] as typeof motion.div
  const hidden = blur ? { opacity: 0, x, y, filter: 'blur(10px)' } : { opacity: 0, x, y }
  const shown = blur ? { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' } : { opacity: 1, x: 0, y: 0 }

  return (
    <Comp
      className={className}
      style={{ ...style, pointerEvents: show ? undefined : 'none' }}
      initial={hidden}
      animate={show ? shown : hidden}
      transition={{ duration, ease: EASE_OUT, delay: show ? delay : 0 }}
      aria-hidden={show ? undefined : true}
    >
      {children}
    </Comp>
  )
}
