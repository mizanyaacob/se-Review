import { motion } from 'motion/react'
import type { SceneProps } from '../chapters/types'
import { COLORS, EASE_OUT, hexA } from '../lib/utils'
import { Reveal } from './Reveal'
import { Kicker, Stage } from './Stage'
import { StatusDot } from './StatusDot'

const BLOCKS = 20

/** Deterministic pseudo-random in [0, 1) so the break-apart looks the same every run. */
const noise = (i: number, salt: number) => {
  const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return s - Math.floor(s)
}

/**
 * Act 2 — the ground moves.
 * Beat 0: Unreal, familiar. Beat 1: it breaks apart. Beat 2: Unity appears. Beat 3: the realisation.
 */
export function EngineMigration({ beat }: SceneProps) {
  const broken = beat >= 1
  const unity = beat >= 2
  const reflection = beat >= 3
  const warn = COLORS.warn

  return (
    <Stage wide>
      <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,540px)_1fr]">
        <div className="flex flex-col">
          {/* Unreal */}
          <motion.div
            className="glass relative rounded-2xl p-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, borderColor: broken ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)' }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            <div className="flex items-center justify-between">
              <span className="mono-label">Engine</span>
              <StatusDot label={broken ? 'Migrating' : 'Stable'} color={broken ? warn : COLORS.ok} pulse={broken} />
            </div>
            <motion.p
              className="display mt-4 text-[clamp(3rem,5vw,4.6rem)]"
              animate={broken ? { opacity: 0.16, x: [0, -8, 6, -3, 0], filter: 'blur(2px)' } : { opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55 }}
            >
              UNREAL
            </motion.p>
            <div className="mt-5 flex gap-1" aria-hidden>
              {Array.from({ length: BLOCKS }, (_, i) => (
                <motion.span
                  key={i}
                  className="h-3 flex-1 rounded-[2px] bg-paper"
                  initial={false}
                  animate={
                    broken
                      ? { x: (noise(i, 1) - 0.5) * 440, y: 80 + noise(i, 2) * 300, rotate: (noise(i, 3) - 0.5) * 200, opacity: 0 }
                      : { x: 0, y: 0, rotate: 0, opacity: 0.9 }
                  }
                  transition={{ duration: broken ? 1.2 : 0.5, delay: broken ? noise(i, 4) * 0.4 : 0, ease: [0.4, 0, 0.6, 1] }}
                />
              ))}
            </div>
            <motion.p className="mono-label mt-4" animate={{ opacity: broken ? 0.3 : 1 }}>
              Familiar territory
            </motion.p>
          </motion.div>

          {/* The move */}
          <div className="relative flex h-24 items-center justify-center">
            <motion.span
              className="absolute top-1 bottom-1 w-px origin-top"
              style={{ background: `linear-gradient(${warn}, ${hexA(warn, 0.1)})` }}
              initial={false}
              animate={{ scaleY: broken ? 1 : 0 }}
              transition={{ duration: 0.8, delay: broken ? 0.35 : 0 }}
            />
            <Reveal show={broken} delay={0.6} className="relative">
              <span className="rounded-full border bg-ink px-4 py-1.5 font-mono text-[0.7rem] tracking-[0.24em]" style={{ borderColor: hexA(warn, 0.6), color: warn }}>
                MIGRATION ↓
              </span>
            </Reveal>
          </div>

          {/* Unity */}
          <Reveal show={unity} y={28}>
            <div className="glass rounded-2xl p-7" style={{ borderColor: hexA(warn, 0.3) }}>
              <div className="flex items-center justify-between">
                <span className="mono-label">Engine</span>
                <StatusDot label="New project engine" color={COLORS.paper} />
              </div>
              <p className="display mt-4 text-[clamp(3rem,5vw,4.6rem)]">UNITY</p>
              <div className="mt-5 flex gap-1" aria-hidden>
                {Array.from({ length: BLOCKS }, (_, i) => (
                  <motion.span
                    key={i}
                    className="h-3 flex-1 rounded-[2px] border border-white/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: unity ? 1 : 0 }}
                    transition={{ delay: unity ? 0.3 + i * 0.03 : 0 }}
                  />
                ))}
              </div>
              <p className="mono-label mt-4">Unfamiliar at production level</p>
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal>
            <Kicker>Act 2</Kicker>
          </Reveal>
          <Reveal delay={0.08} blur>
            <h2 className="display mt-5 text-[clamp(3.2rem,6vw,6.2rem)]">
              Then the ground <span style={{ color: warn }}>moved.</span>
            </h2>
          </Reveal>
          <div className="mt-14 space-y-4">
            <Reveal show={reflection} blur>
              <p className="text-[clamp(1.7rem,2.6vw,2.5rem)] tracking-tight text-dim">I had used Unity before.</p>
            </Reveal>
            <Reveal show={reflection} delay={0.9} blur>
              <p className="text-[clamp(1.7rem,2.6vw,2.5rem)] font-medium tracking-tight">But production Unity was different.</p>
            </Reveal>
          </div>
        </div>
      </div>
    </Stage>
  )
}
