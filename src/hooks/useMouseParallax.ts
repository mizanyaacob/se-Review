import { motionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

// One shared pointer listener for every parallax layer on the page.
const pointerX = motionValue(0)
const pointerY = motionValue(0)
let attached = false

function attach() {
  if (attached || typeof window === 'undefined') return
  attached = true
  window.addEventListener(
    'pointermove',
    (e) => {
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1)
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true },
  )
}

/** Returns spring-smoothed x/y offsets in px, in the range [-strength, strength]. */
export function useMouseParallax(strength = 12) {
  attach()
  const reduce = useReducedMotion()
  const sx = useSpring(pointerX, { stiffness: 45, damping: 18, mass: 0.7 })
  const sy = useSpring(pointerY, { stiffness: 45, damping: 18, mass: 0.7 })
  const x = useTransform(sx, (v) => (reduce ? 0 : v * strength))
  const y = useTransform(sy, (v) => (reduce ? 0 : v * strength))
  return { x, y }
}
