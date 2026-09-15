import { useScroll, useSpring } from 'motion/react'

/** Smoothed 0→1 page scroll progress, used by the overview page's reading bar. */
export function useScrollProgress() {
  const { scrollYProgress } = useScroll()
  return useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
}
