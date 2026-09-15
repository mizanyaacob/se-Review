import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { SceneProps } from '../chapters/types'
import { working } from '../data/selfEvaluation'
import { sfx } from '../lib/sfx'
import { COLORS, EASE_OUT, cn, hexA, pad2 } from '../lib/utils'
import { Reveal } from './Reveal'
import { SceneTitle, Stage } from './Stage'

type Certificate = (typeof working.certificates)[number]

const CERTS = working.certificates
const TOTAL_HOURS = CERTS.reduce((n, c) => n + c.hours, 0)
const TRACK_COLOR: Record<string, string> = { Unreal: '#F5A83C', Unity: '#FFD08A', 'CI/CD': '#67D4E6' }
const imageUrl = (c: Certificate) => `${import.meta.env.BASE_URL}certificates/${c.id}.jpg`
const formatHours = (h: number) => `${Number.isInteger(h) ? h : h.toFixed(1)}h`

/**
 * Cover-flow carousel of course certificates.
 * Beats: one per certificate. Side cards are clickable; the centre card opens a full-size view.
 */
export function CertificateCarousel({ beat, accent }: SceneProps) {
  const [active, setActive] = useState(Math.min(beat, CERTS.length - 1))
  const [zoomed, setZoomed] = useState(false)

  // Space drives the carousel; clicks can move it freely in between.
  useEffect(() => {
    setActive(Math.min(beat, CERTS.length - 1))
  }, [beat])

  const go = (i: number) => {
    const next = Math.max(0, Math.min(CERTS.length - 1, i))
    if (next !== active) sfx.play('select')
    setActive(next)
  }
  const cert = CERTS[active]

  return (
    <Stage wide>
      <div className="flex items-end justify-between gap-8">
        <SceneTitle kicker="Working Knowledge · Proof of learning" title={`${CERTS.length} courses. ${TOTAL_HOURS} hours.`} accent={accent} />
        <Reveal delay={0.15} className="pb-1 text-right">
          <p className="font-pixel text-[16px] tracking-[2px] uppercase" style={{ color: accent }}>
            Certificates
          </p>
          <p className="mt-1 font-mono text-[1.6rem] tabular-nums">
            {pad2(active + 1)}
            <span className="text-faint"> / {pad2(CERTS.length)}</span>
          </p>
        </Reveal>
      </div>

      {/* cover flow */}
      <Reveal delay={0.1} y={30}>
        <div
          className="relative mt-6"
          style={
            {
              '--card-w': 'min(560px, 40vw, calc((100svh - 440px) * 1.344))',
              height: 'calc(var(--card-w) / 1.344 + 12px)',
              perspective: '1800px',
            } as CSSProperties
          }
        >
          {CERTS.map((c, i) => {
            const rel = i - active
            const centre = rel === 0
            const hidden = Math.abs(rel) > 1
            return (
              <motion.button
                key={c.id}
                type="button"
                aria-label={centre ? `Open ${c.title} certificate` : `Show ${c.title} certificate`}
                tabIndex={hidden ? -1 : 0}
                onClick={() => (centre ? setZoomed(true) : go(i))}
                className={cn('group absolute top-0 overflow-hidden rounded-xl border bg-ink-2 p-0', centre ? 'cursor-zoom-in' : 'cursor-pointer')}
                style={{ width: 'var(--card-w)', left: 'calc(50% - var(--card-w) / 2)', aspectRatio: '1.344', transformStyle: 'preserve-3d', pointerEvents: hidden ? 'none' : 'auto' }}
                initial={false}
                animate={{
                  x: `${rel * 82}%`,
                  rotateY: rel * -32,
                  scale: centre ? 1 : 0.76,
                  opacity: hidden ? 0 : centre ? 1 : 0.7,
                  zIndex: 10 - Math.abs(rel),
                  borderColor: centre ? hexA(accent, 0.55) : 'rgba(255,255,255,0.08)',
                  boxShadow: centre ? `0 40px 90px -30px ${hexA(accent, 0.45)}` : '0 20px 50px -30px rgba(0,0,0,0.9)',
                }}
                transition={{ type: 'spring', stiffness: 170, damping: 24 }}
              >
                <img src={imageUrl(c)} alt={`${c.title} certificate of completion`} className="size-full object-cover" draggable={false} decoding="async" />
                {/* dim the side cards so the centre one reads as selected */}
                <motion.span aria-hidden className="absolute inset-0 bg-ink" initial={false} animate={{ opacity: centre ? 0 : 0.5 }} transition={{ duration: 0.3 }} />
                {centre && (
                  <>
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
                      initial={{ left: '-40%' }}
                      animate={{ left: '140%' }}
                      transition={{ duration: 0.9, delay: 0.25, ease: 'easeInOut' }}
                    />
                    <motion.span
                      key={`stamp-${c.id}`}
                      className="font-pixel absolute top-4 right-4 rounded-md border-2 bg-ink/85 px-3 py-1.5 text-[16px] tracking-[1px] uppercase"
                      style={{ borderColor: COLORS.ok, color: COLORS.ok }}
                      initial={{ opacity: 0, scale: 1.8, rotate: -16 }}
                      animate={{ opacity: 1, scale: 1, rotate: -6 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.35 }}
                    >
                      Completed
                    </motion.span>
                    <span className="absolute right-4 bottom-4 grid size-9 place-items-center rounded-full bg-ink/80 text-paper opacity-0 transition-opacity group-hover:opacity-100">
                      <Maximize2 size={16} />
                    </span>
                  </>
                )}
              </motion.button>
            )
          })}

          <CarouselArrow side="left" disabled={active === 0} onClick={() => go(active - 1)} />
          <CarouselArrow side="right" disabled={active === CERTS.length - 1} onClick={() => go(active + 1)} />
        </div>
      </Reveal>

      {/* details + hours */}
      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="min-h-[120px]" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={cert.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE_OUT }}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full px-3 py-1 font-mono text-[0.66rem] font-semibold tracking-[0.16em] text-ink uppercase" style={{ background: TRACK_COLOR[cert.track] }}>
                  {cert.track}
                </span>
                <span className="font-mono text-[0.7rem] tracking-[0.14em] text-dim uppercase">
                  Udemy · {cert.date} · {formatHours(cert.hours)}
                </span>
              </div>
              <h3 className="mt-3 text-[clamp(1.4rem,2vw,1.9rem)] leading-tight font-semibold tracking-tight">{cert.title}</h3>
              <p className="mt-1 text-[1rem] text-dim">
                {cert.instructors} · <span className="text-paper/80">{cert.relevance}</span>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="mono-label">Learning hours</span>
            <span className="font-mono text-[0.9rem] tabular-nums">{TOTAL_HOURS}h total</span>
          </div>
          <div className="mt-3 flex h-3.5 gap-[3px] overflow-hidden rounded-[3px]">
            {CERTS.map((c, i) => (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`${c.title}: ${formatHours(c.hours)}`}
                title={`${c.title} · ${formatHours(c.hours)}`}
                className="h-full"
                style={{ width: `${(c.hours / TOTAL_HOURS) * 100}%`, background: TRACK_COLOR[c.track] }}
                initial={false}
                animate={{ opacity: i === active ? 1 : 0.28 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              {CERTS.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Certificate ${i + 1}`}
                  aria-current={i === active}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: i === active ? 28 : 8, background: i === active ? accent : 'rgba(255,255,255,0.18)' }}
                />
              ))}
            </div>
            <button type="button" onClick={() => setZoomed(true)} className="inline-flex items-center gap-2 font-mono text-[0.66rem] tracking-[0.16em] text-dim uppercase hover:text-paper">
              <Maximize2 size={13} /> View full size
            </button>
          </div>
        </div>
      </div>

      {zoomed && <Lightbox index={active} onIndex={go} onClose={() => setZoomed(false)} accent={accent} />}
    </Stage>
  )
}

function CarouselArrow({ side, disabled, onClick }: { side: 'left' | 'right'; disabled: boolean; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === 'left' ? 'Previous certificate' : 'Next certificate'}
      className={cn(
        'absolute top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line-2 bg-ink/80 text-paper backdrop-blur transition-all hover:scale-110 hover:border-paper/40 disabled:pointer-events-none disabled:opacity-0',
        side === 'left' ? 'left-0' : 'right-0',
      )}
    >
      <Icon size={20} />
    </button>
  )
}

/**
 * Full-size certificate view. Rendered in a portal above the HUD, and it swallows
 * keyboard/wheel input so presentation navigation doesn't move underneath it.
 */
function Lightbox({ index, onIndex, onClose, accent }: { index: number; onIndex: (i: number) => void; onClose: () => void; accent: string }) {
  const cert = CERTS[index]
  const closeRef = useRef<HTMLButtonElement>(null)
  // Latest values in refs so the capture listeners are bound once for the lightbox's lifetime.
  const live = useRef({ index, onIndex, onClose })
  live.current = { index, onIndex, onClose }

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') return
      e.preventDefault()
      e.stopPropagation()
      const { index: i, onIndex: move, onClose: close } = live.current
      if (e.key === 'ArrowLeft') move(i - 1)
      else if (e.key === 'ArrowRight') move(i + 1)
      else if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') close()
    }
    const swallow = (e: Event) => e.stopPropagation()
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('wheel', swallow, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('wheel', swallow, true)
    }
  }, [])

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-5 bg-black/85 p-8 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${cert.title} certificate`}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={cert.id}
          src={imageUrl(cert)}
          alt={`${cert.title} certificate of completion`}
          className="max-h-[80vh] max-w-[min(92vw,1300px)] rounded-lg object-contain shadow-2xl"
          style={{ boxShadow: `0 40px 120px -30px ${hexA(accent, 0.4)}` }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>
      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => onIndex(index - 1)} disabled={index === 0} aria-label="Previous certificate" className="grid size-10 place-items-center rounded-full border border-line-2 text-paper hover:bg-white/5 disabled:opacity-30">
          <ChevronLeft size={18} />
        </button>
        <p className="min-w-[320px] text-center">
          <span className="block text-[1.05rem] font-semibold tracking-tight">{cert.title}</span>
          <span className="block font-mono text-[0.66rem] tracking-[0.14em] text-dim uppercase">
            {pad2(index + 1)} / {pad2(CERTS.length)} · {cert.date} · {formatHours(cert.hours)}
          </span>
        </p>
        <button type="button" onClick={() => onIndex(index + 1)} disabled={index === CERTS.length - 1} aria-label="Next certificate" className="grid size-10 place-items-center rounded-full border border-line-2 text-paper hover:bg-white/5 disabled:opacity-30">
          <ChevronRight size={18} />
        </button>
      </div>
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="absolute top-6 right-6 grid size-10 place-items-center rounded-full border border-line-2 text-paper hover:bg-white/10">
        <X size={18} />
      </button>
      <p className="font-mono text-[0.62rem] tracking-[0.16em] text-faint uppercase">Esc to close · ← → to browse</p>
    </motion.div>,
    document.body,
  )
}
