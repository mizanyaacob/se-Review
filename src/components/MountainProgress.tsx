import { Flag, Mountain, Tent } from 'lucide-react'
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { SceneProps } from '../chapters/types'
import { personal } from '../data/selfEvaluation'
import { useMouseParallax } from '../hooks/useMouseParallax'
import { COLORS, hexA } from '../lib/utils'
import { PixelHero } from './game/PixelHero'
import { Reveal } from './Reveal'
import { Kicker, Stage } from './Stage'

// Chart geometry: 0 m sits at y=470, 800 m at y=50.
const BASE = 470
const K = 0.525
const toY = (m: number) => BASE - m * K
const TICKS = [0, 100, 200, 300, 400, 500, 600, 700, 800]

// Illustrative trail profile. Only the start (0 m), target (500 m) and summit (700 m+) carry meaning.
const TRAIL: Array<[number, number]> = [
  [110, 0], [180, 60], [240, 110], [305, 190], [355, 170], [420, 280],
  [480, 340], [540, 430], [590, 470], [640, 560], [690, 640], [735, 700],
]
const TRAIL_D = 'M' + TRAIL.map(([x, m]) => `${x} ${toY(m).toFixed(1)}`).join(' L')
const MOUNTAIN_D = `M60 ${BASE} L110 ${BASE} ` + TRAIL.slice(1).map(([x, m]) => `L${x} ${toY(m).toFixed(1)}`).join(' ') + ` L790 150 L840 205 L840 ${BASE} Z`
const RIDGE_BACK = `M60 ${BASE} L160 330 L260 360 L380 250 L470 300 L580 220 L700 280 L840 240 L840 ${BASE} Z`

/**
 * Personal goal climb. Beat 1 climbs to the 500 m target, beat 2 continues to the
 * 700 m+ summit, beat 3 shows the outcome.
 */
export function MountainProgress({ beat, mountBeat, accent, advance }: SceneProps) {
  const reduce = useReducedMotion()
  const trailRef = useRef<SVGPathElement>(null)
  const drawnRef = useRef<SVGPathElement>(null)
  const climberRef = useRef<SVGGElement>(null)
  const elevationRef = useRef<HTMLSpanElement>(null)
  const progress = useMotionValue(0)
  const [geometry, setGeometry] = useState<{ total: number; at500: number; x500: number } | null>(null)
  const [passed, setPassed] = useState(0)
  const [climbing, setClimbing] = useState(false)
  const bucketRef = useRef(0)
  const back = useMouseParallax(10)

  const achieved = beat >= 1
  const exceeded = beat >= 2
  const arrivedInstantly = mountBeat >= beat
  const climbDelay = (seconds: number) => (arrivedInstantly || reduce ? 0 : seconds)

  // Measure the trail once so beats can target real path lengths.
  useLayoutEffect(() => {
    const path = trailRef.current
    if (!path) return
    const total = path.getTotalLength()
    const targetY = toY(500)
    // coarse scan for the first crossing, then bisect so the climb stops at exactly 500 m
    let lo = 0
    let hi = total
    for (let i = 1; i <= 200; i++) {
      const len = (total * i) / 200
      if (path.getPointAtLength(len).y <= targetY) {
        lo = (total * (i - 1)) / 200
        hi = len
        break
      }
    }
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (path.getPointAtLength(mid).y <= targetY) hi = mid
      else lo = mid
    }
    const at500 = lo
    if (drawnRef.current) {
      // one dash + one gap as long as the whole trail, offset fully so nothing is drawn until the climb starts
      drawnRef.current.style.strokeDasharray = `${total} ${total}`
      drawnRef.current.style.strokeDashoffset = `${total}`
    }
    setGeometry({ total, at500, x500: path.getPointAtLength(at500).x })
  }, [])

  useMotionValueEvent(progress, 'change', (len) => {
    const path = trailRef.current
    if (!path || !geometry) return
    const p = path.getPointAtLength(len)
    climberRef.current?.setAttribute('transform', `translate(${p.x} ${p.y})`)
    if (drawnRef.current) drawnRef.current.style.strokeDashoffset = `${geometry.total - len}`
    const meters = Math.max(0, Math.round((BASE - p.y) / K))
    if (elevationRef.current) elevationRef.current.textContent = String(meters)
    const bucket = Math.floor(meters / 100) * 100
    if (bucket !== bucketRef.current) {
      bucketRef.current = bucket
      setPassed(bucket)
    }
  })

  useEffect(() => {
    if (!geometry) return
    const target = beat >= 2 ? geometry.total : beat >= 1 ? geometry.at500 : 0
    if (reduce || arrivedInstantly) {
      progress.set(target)
      return
    }
    if (Math.abs(progress.get() - target) < 0.5) return
    setClimbing(true)
    const controls = animate(progress, target, { duration: beat >= 2 ? 2 : 2.6, ease: [0.45, 0, 0.25, 1], onComplete: () => setClimbing(false) })
    return () => {
      controls.stop()
      setClimbing(false)
    }
  }, [beat, geometry, reduce, arrivedInstantly, progress])

  return (
    <Stage wide>
      <div className="grid items-center gap-12 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <Reveal>
            <Kicker accent={accent}>
              {personal.mountain} · {personal.region}
            </Kicker>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-[40ch] text-[1.1rem] leading-snug text-dim">
              This year I went on a few hiking trips and tried camping too. One of those hikes took me up Mount Alai.
            </p>
          </Reveal>

          <p className="display mt-6 flex items-baseline text-[clamp(5rem,10vw,10rem)] tabular-nums" aria-live="polite">
            <span ref={elevationRef}>0</span>
            <span className="ml-3 text-[0.38em] tracking-normal text-dim">m</span>
            <Reveal as="span" show={exceeded} delay={climbDelay(2)} className="ml-1 text-[0.5em] tracking-normal" y={0}>
              <span style={{ color: accent }}>+</span>
            </Reveal>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-line-2 px-4 py-2 font-mono text-[0.7rem] tracking-[0.18em] text-dim uppercase">Target · {personal.targetMeters}m</span>
            <Reveal as="span" show={achieved} delay={climbDelay(2.6)} y={8}>
              <span className="inline-block rounded-full border px-4 py-2 font-mono text-[0.7rem] tracking-[0.18em] uppercase" style={{ borderColor: hexA(accent, 0.5), color: accent }}>
                Goal achieved
              </span>
            </Reveal>
            <Reveal as="span" show={exceeded} delay={climbDelay(2)} y={8}>
              <span className="inline-block rounded-full px-4 py-2 font-mono text-[0.7rem] font-semibold tracking-[0.18em] text-ink uppercase" style={{ background: accent }}>
                Target exceeded
              </span>
            </Reveal>
          </div>

          {beat === 0 && (
            <motion.button
              type="button"
              onClick={advance}
              className="mt-10 inline-flex items-center gap-3 rounded-full border border-line-2 px-5 py-3 font-mono text-xs tracking-[0.16em] uppercase hover:bg-white/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Mountain size={16} style={{ color: accent }} /> Start the climb <span className="kbd">Space</span>
            </motion.button>
          )}

          <Reveal show={beat >= 3} className="mt-10">
            <dl className="grid grid-cols-3 gap-3">
              {[
                { v: `${personal.summitMeters}m+`, l: personal.mountain },
                { v: `${personal.targetMeters}m`, l: 'Original target' },
                { v: String(personal.activities.length), l: personal.activities.join(' · ') },
              ].map((m) => (
                <div key={m.l} className="glass rounded-xl p-4">
                  <dt className="sr-only">{m.l}</dt>
                  <dd className="text-[1.6rem] font-semibold tracking-tight tabular-nums">{m.v}</dd>
                  <dd className="mt-1 font-mono text-[0.62rem] tracking-[0.14em] text-dim uppercase">{m.l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal show={beat >= 3} delay={0.35} className="mt-8">
            <p className="flex items-center gap-3 text-[clamp(1.3rem,1.9vw,1.8rem)] tracking-tight">
              <Tent size={22} style={{ color: accent }} className="shrink-0" />I needed something outside the screen to recharge.
            </p>
          </Reveal>
        </div>

        <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }}>
          <svg
            viewBox="0 0 860 500"
            className="w-full cursor-pointer overflow-visible"
            role="img"
            aria-label={`Elevation climb: target ${personal.targetMeters} metres, summit of ${personal.mountain} over ${personal.summitMeters} metres`}
            onClick={() => beat < 3 && advance()}
          >
            <defs>
              <linearGradient id="mtn-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.2" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </linearGradient>
            </defs>

            {TICKS.map((m) => (
              <g key={m}>
                <line x1="60" x2="840" y1={toY(m)} y2={toY(m)} stroke="rgba(255,255,255,0.05)" />
                <text
                  x="44"
                  y={toY(m) + 4}
                  textAnchor="end"
                  className="font-mono transition-colors duration-500"
                  fontSize="12"
                  fill={m <= passed && m > 0 ? COLORS.paper : COLORS.faint}
                >
                  {m}
                </text>
              </g>
            ))}

            <motion.path d={RIDGE_BACK} fill="rgba(255,255,255,0.025)" style={{ x: back.x, y: back.y }} />
            <path d={MOUNTAIN_D} fill="url(#mtn-fill)" stroke="rgba(255,255,255,0.08)" />
            <path ref={trailRef} d={TRAIL_D} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray="3 7" />
            <path ref={drawnRef} d={TRAIL_D} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDashoffset: 9999 }} />

            {/* 500 m target */}
            <line x1="60" x2="840" y1={toY(500)} y2={toY(500)} stroke={achieved ? accent : COLORS.paper} strokeOpacity={achieved ? 0.9 : 0.5} strokeDasharray="6 6" className="transition-all duration-700" />
            <text x="836" y={toY(500) - 10} textAnchor="end" fontSize="12" className="font-mono" fill={achieved ? accent : COLORS.dim} letterSpacing="2">
              TARGET 500M
            </text>

            {/* summit */}
            <motion.g initial={false} animate={{ opacity: exceeded ? 1 : 0 }} transition={{ delay: climbDelay(2), duration: 0.5 }}>
              <line x1="735" y1={toY(700)} x2="735" y2={toY(700) - 52} stroke={COLORS.paper} strokeWidth="1.5" />
              <path d={`M735 ${toY(700) - 52} L765 ${toY(700) - 43} L735 ${toY(700) - 34} Z`} fill={accent} />
              <text x="720" y={toY(700) - 40} textAnchor="end" fontSize="16" fontWeight="600" fill={COLORS.paper}>
                700M+
              </text>
            </motion.g>

            {/* 500 m checkpoint flag on the target line, just behind where the climber stops; raised on arrival */}
            {geometry && (
              <g transform={`translate(${geometry.x500 - 44} ${toY(500)})`}>
                <line x1="0" y1="0" x2="0" y2="-46" stroke={COLORS.paper} strokeWidth="2" shapeRendering="crispEdges" />
                <motion.rect
                  x="2"
                  width="22"
                  height="12"
                  fill={achieved ? accent : 'rgba(255,255,255,0.25)'}
                  shapeRendering="crispEdges"
                  initial={false}
                  animate={{ y: achieved ? -46 : -14 }}
                  transition={{ duration: 0.5, delay: climbDelay(2.5) }}
                />
                <text x="-8" y="-36" textAnchor="end" fontSize="11" className="font-mono" letterSpacing="2" fill={achieved ? accent : COLORS.faint}>
                  CHECKPOINT
                </text>
              </g>
            )}

            <g ref={climberRef} transform={`translate(${TRAIL[0][0]} ${toY(0)})`}>
              <ellipse rx="14" ry="4" fill={accent} opacity="0.25" />
              <PixelHero accent={accent} walking={climbing} scale={2.4} x={-14.4} y={-38.4} />
            </g>
          </svg>
          <p className="mt-2 flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-faint uppercase">
            <Flag size={12} /> Trail shape is illustrative · summit elevation from my review: 700m+
          </p>
        </motion.div>
      </div>
    </Stage>
  )
}
