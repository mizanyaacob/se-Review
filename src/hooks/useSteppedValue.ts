import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * Walks an integer toward `target` one step per `interval` ms, so sequences
 * (timeline nodes lighting up, tools unlocking) play out instead of popping in.
 * Decreases and reduced-motion jump straight to the target.
 */
export function useSteppedValue(target: number, interval = 300, startAtTarget = false) {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(() => (startAtTarget ? target : 0))

  useEffect(() => {
    if (value === target) return
    if (reduce || target < value) {
      setValue(target)
      return
    }
    const t = window.setTimeout(() => setValue((v) => Math.min(target, v + 1)), interval)
    return () => window.clearTimeout(t)
  }, [value, target, interval, reduce])

  return value
}
