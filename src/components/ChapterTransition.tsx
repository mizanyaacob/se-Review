import type { Variants } from 'motion/react'
import type { ChapterId } from '../data/selfEvaluation'
import { EASE_OUT } from '../lib/utils'

/**
 * Each chapter moves differently, so the reviewer feels the change of gear:
 *  prologue      blur in, like a memory
 *  working       push in, dense and energetic
 *  retaining     rises, like something passed upward
 *  personal      slow dissolve â€” the deliberate slowdown
 *  departmental  horizontal wipe, like a pipeline stage
 *  organizational zoom out
 *  epilogue      long, quiet fade
 */
export const sceneVariants: Record<ChapterId, Variants> = {
  prologue: {
    initial: { opacity: 0, filter: 'blur(14px)' },
    animate: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE_OUT } },
    exit: { opacity: 0, filter: 'blur(14px)', transition: { duration: 0.35 } },
  },
  working: {
    initial: (dir: number) => ({ opacity: 0, scale: dir > 0 ? 1.035 : 0.97, x: dir * 30 }),
    animate: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.75, ease: EASE_OUT } },
    exit: (dir: number) => ({ opacity: 0, scale: dir > 0 ? 0.97 : 1.03, x: dir * -30, transition: { duration: 0.3 } }),
  },
  retaining: {
    initial: (dir: number) => ({ opacity: 0, y: dir * 48 }),
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
    exit: (dir: number) => ({ opacity: 0, y: dir * -36, transition: { duration: 0.32 } }),
  },
  personal: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 1.4, ease: 'easeInOut' } },
    exit: { opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
  },
  departmental: {
    initial: (dir: number) => ({ opacity: 0, clipPath: dir > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }),
    animate: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.8, ease: EASE_OUT } },
    exit: (dir: number) => ({ opacity: 0, clipPath: dir > 0 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)', transition: { duration: 0.4 } }),
  },
  organizational: {
    initial: { opacity: 0, scale: 1.12 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: EASE_OUT } },
    exit: { opacity: 0, scale: 0.92, transition: { duration: 0.35 } },
  },
  epilogue: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 1.2, ease: 'easeInOut' } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  },
}
