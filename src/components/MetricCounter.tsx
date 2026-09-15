import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { cn } from '../lib/utils'

/** Counts from 0 to `value` once visible. Writes to the DOM directly, so it never re-renders React. */
export function MetricCounter({ value, start = true, duration = 1.6, delay = 0, className }: { value: number; start?: boolean; duration?: number; delay?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !start || !inView) return
    if (reduce) {
      el.textContent = String(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [start, inView, value, duration, delay, reduce])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      0
    </span>
  )
}

/** Discrete slots with a target marker, e.g. 3 sessions against a target of 2. */
export function SegmentMeter({ value, target, max, accent, show = true, labelTarget = 'Target' }: { value: number; target: number; max: number; accent: string; show?: boolean; labelTarget?: string }) {
  return (
    <div className="relative flex w-full items-center gap-2 pt-6">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className="relative h-3 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="absolute inset-0 origin-left rounded-full transition-transform duration-700 ease-out"
            style={{ background: accent, transform: `scaleX(${show && i < value ? 1 : 0})`, transitionDelay: `${show ? 200 + i * 220 : 0}ms` }}
          />
        </div>
      ))}
      {/* marker sits in the 8px gap right after the target-th slot */}
      <div
        className="absolute top-0 bottom-[-6px] w-px bg-paper/70"
        style={{ left: target >= max ? '100%' : `calc(${target / max} * (100% - ${(max - 1) * 8}px) + ${(target - 1) * 8 + 4}px)` }}
      >
        <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 -translate-y-full font-mono text-[0.62rem] tracking-[0.14em] whitespace-nowrap text-paper/80 uppercase">
          {labelTarget} {target}
        </span>
      </div>
    </div>
  )
}
