/**
 * Tiny synthesized sound effects (no audio files). Muted by default so nothing
 * surprises the room; the presenter turns sound on with the HUD speaker or `M`.
 */

let ctx: AudioContext | null = null
const MUTE_KEY = 'se-review:muted'

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) !== 'false'
  } catch {
    return true
  }
}

let muted = readMuted()
const listeners = new Set<(m: boolean) => void>()

export const sfx = {
  get muted() {
    return muted
  },
  setMuted(value: boolean) {
    muted = value
    try {
      localStorage.setItem(MUTE_KEY, String(value))
    } catch {
      /* storage can be blocked */
    }
    listeners.forEach((l) => l(value))
    if (!value) sfx.play('select')
  },
  subscribe(listener: (m: boolean) => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  /** Filtered white-noise sweep: rocket rumble, warp whoosh, landing thud. */
  noise(name: 'liftoff' | 'whoosh' | 'thud') {
    if (muted) return
    try {
      ctx ??= new AudioContext()
      if (ctx.state === 'suspended') void ctx.resume()
      const spec = {
        liftoff: { dur: 1.6, type: 'lowpass' as BiquadFilterType, f0: 900, f1: 180, peak: 0.22 },
        whoosh: { dur: 0.9, type: 'bandpass' as BiquadFilterType, f0: 300, f1: 2400, peak: 0.16 },
        thud: { dur: 0.45, type: 'lowpass' as BiquadFilterType, f0: 260, f1: 60, peak: 0.3 },
      }[name]
      const now = ctx.currentTime
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * spec.dur), ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
      const src = ctx.createBufferSource()
      src.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = spec.type
      filter.frequency.setValueAtTime(spec.f0, now)
      filter.frequency.exponentialRampToValueAtTime(spec.f1, now + spec.dur)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(spec.peak, now + spec.dur * 0.25)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.dur)
      src.connect(filter).connect(gain).connect(ctx.destination)
      src.start(now)
      src.stop(now + spec.dur + 0.05)
    } catch {
      /* audio unavailable */
    }
  },
  play(name: 'select' | 'step' | 'unlock' | 'clear' | 'load') {
    if (muted) return
    try {
      ctx ??= new AudioContext()
      if (ctx.state === 'suspended') void ctx.resume()
      const now = ctx.currentTime
      const notes: Record<typeof name, Array<[number, number, number]>> = {
        // [frequency Hz, start offset s, duration s]
        select: [[880, 0, 0.06]],
        step: [[660, 0, 0.035]],
        unlock: [
          [784, 0, 0.09],
          [988, 0.08, 0.09],
          [1319, 0.16, 0.22],
        ],
        clear: [
          [523, 0, 0.1],
          [659, 0.1, 0.1],
          [784, 0.2, 0.1],
          [1047, 0.3, 0.3],
        ],
        load: [
          [330, 0, 0.08],
          [440, 0.09, 0.12],
        ],
      }
      for (const [freq, offset, dur] of notes[name]) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0, now + offset)
        gain.gain.linearRampToValueAtTime(0.045, now + offset + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + dur)
        osc.connect(gain).connect(ctx.destination)
        osc.start(now + offset)
        osc.stop(now + offset + dur + 0.02)
      }
    } catch {
      /* audio unavailable */
    }
  },
}
