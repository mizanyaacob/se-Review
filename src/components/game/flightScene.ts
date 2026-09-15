/**
 * Canvas renderer for the chapter transitions: starfield, pixel rocket, exhaust,
 * smoke, destination planet and landing ridge. Pure drawing — no React.
 */

export type FlightKind = 'launch' | 'warp' | 'land'

// 11 × 14 pixel rocket, nose up. a accent · r hull · k window · h pilot hair · s pilot skin · f fins · g nozzle
const BODY = [
  '.....a.....',
  '....aaa....',
  '....rrr....',
  '...rrrrr...',
  '...rkhkr...',
  '...rkskr...',
  '...rrrrr...',
  '...aaaaa...',
  '...rrrrr...',
  '...rrrrr...',
  '..frrrrrf..',
  '.ffrrrrrff.',
  '.ff.ggg.ff.',
  '....ggg....',
]
const FLAME = [
  ['....oyo....', '....yoy....', '.....y.....'],
  ['...oyyyo...', '....oyo....', '....o.o....'],
]
const COLS = 11

type Ease = 'smooth' | 'in' | 'out' | 'linear'
const ease = (u: number, e: Ease) => (e === 'in' ? u * u : e === 'out' ? 1 - (1 - u) * (1 - u) : e === 'linear' ? u : u * u * (3 - 2 * u))

/** Piecewise keyframe interpolation. */
function kf(t: number, times: number[], values: number[], eases: Ease[] = []) {
  if (t <= times[0]) return values[0]
  for (let i = 1; i < times.length; i++) {
    if (t <= times[i]) {
      const u = (t - times[i - 1]) / (times[i] - times[i - 1])
      return values[i - 1] + (values[i] - values[i - 1]) * ease(u, eases[i - 1] ?? 'smooth')
    }
  }
  return values[values.length - 1]
}

function rgba(hex: string, a: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  color: string
  kind: 'spark' | 'smoke'
}

interface Star {
  x: number
  y: number
  z: number
  tint: boolean
}

export interface FlightOptions {
  kind: FlightKind
  accent: string
  /** Big label drawn on the destination planet (warp only). */
  planetLabel?: string
  ringed?: boolean
  durationMs: number
}

export function createFlight(canvas: HTMLCanvasElement, opts: FlightOptions) {
  const ctx = canvas.getContext('2d')!
  let w = 0
  let h = 0
  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()

  const stars: Star[] = Array.from({ length: 230 }, () => ({ x: Math.random(), y: Math.random(), z: 0.15 + Math.random() * 0.85, tint: Math.random() < 0.16 }))
  const particles: Particle[] = []
  const { kind, accent, durationMs } = opts
  let last = performance.now()
  const start = last

  function starSpeed(t: number) {
    if (kind === 'warp') return kf(t, [0, 0.22, 0.82, 1], [0.05, 1, 1, 0.3])
    if (kind === 'launch') return kf(t, [0, 0.38, 0.72], [0, 0, 1], ['linear', 'in'])
    return kf(t, [0, 0.3, 0.8], [1, 1, 0], ['linear', 'out'])
  }

  function drawStars(dt: number, speed: number) {
    const buckets: Array<[number, number, number, number, string, number]> = []
    for (const s of stars) {
      const v = speed * s.z * (kind === 'warp' ? 2600 : 2000)
      const len = Math.max(1.2, v * 0.04)
      let x = s.x * w
      let y = s.y * h
      if (kind === 'warp') {
        x -= v * dt
        if (x < -len) {
          x = w + Math.random() * 60
          y = Math.random() * h
        }
        buckets.push([x, y, x + len, y, s.tint ? accent : '#ECE9E2', 0.2 + s.z * 0.65])
      } else if (kind === 'launch') {
        y += v * dt
        if (y > h + len) {
          y = -Math.random() * 60
          x = Math.random() * w
        }
        buckets.push([x, y, x, y - len, s.tint ? accent : '#ECE9E2', 0.2 + s.z * 0.65])
      } else {
        y -= v * dt
        if (y < -len) {
          y = h + Math.random() * 60
          x = Math.random() * w
        }
        buckets.push([x, y, x, y + len, s.tint ? accent : '#ECE9E2', 0.2 + s.z * 0.65])
      }
      s.x = x / w
      s.y = y / h
    }
    ctx.lineCap = 'round'
    for (const [x1, y1, x2, y2, color, a] of buckets) {
      ctx.strokeStyle = color === '#ECE9E2' ? `rgba(236,233,226,${a})` : rgba(accent, a)
      ctx.lineWidth = a > 0.6 ? 2 : 1.2
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }

  function drawRocket(cx: number, cy: number, P: number, angle: number, scale: number, flame: boolean, now: number) {
    const frame = Math.floor(now / 90) % 2
    const rows = flame ? [...BODY, ...FLAME[frame]] : BODY
    const pal: Record<string, string> = { a: accent, r: '#ECE9E2', k: '#1E2A3A', h: '#23242B', s: '#E6BE94', f: accent, g: '#5D5F67', o: '#F5A83C', y: '#FFE08A' }
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.scale(scale, scale)
    const ox = (-COLS * P) / 2
    const oy = (-BODY.length * P) / 2
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < COLS; x++) {
        const ch = rows[y][x]
        if (ch === '.') continue
        ctx.fillStyle = pal[ch]
        ctx.fillRect(ox + x * P, oy + y * P, P + 0.6, P + 0.6)
      }
    }
    ctx.restore()
  }

  /** World position of the nozzle for a rocket centred at (cx, cy). */
  function nozzle(cx: number, cy: number, P: number, angle: number, scale: number) {
    const d = (BODY.length * P * scale) / 2
    return { x: cx - d * Math.sin(angle), y: cy + d * Math.cos(angle), dirX: -Math.sin(angle), dirY: Math.cos(angle) }
  }

  function emitExhaust(n: { x: number; y: number; dirX: number; dirY: number }, count: number, speed: number) {
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 0.6
      const vx = (n.dirX + -n.dirY * spread) * speed * (0.6 + Math.random() * 0.6)
      const vy = (n.dirY + n.dirX * spread) * speed * (0.6 + Math.random() * 0.6)
      const r = Math.random()
      particles.push({ x: n.x, y: n.y, vx, vy, life: 0, max: 0.35 + Math.random() * 0.35, size: 3 + Math.random() * 5, color: r < 0.45 ? '#FFE08A' : r < 0.8 ? '#F5A83C' : accent, kind: 'spark' })
    }
  }

  function emitSmoke(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      particles.push({ x: x + (Math.random() - 0.5) * 30, y, vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 40, life: 0, max: 0.9 + Math.random() * 0.7, size: 14 + Math.random() * 18, color: '#9A9BA3', kind: 'smoke' })
    }
  }

  function drawParticles(dt: number) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.life += dt
      if (p.life >= p.max) {
        particles.splice(i, 1)
        continue
      }
      p.x += p.vx * dt
      p.y += p.vy * dt
      const k = p.life / p.max
      if (p.kind === 'spark') {
        const s = Math.max(1, p.size * (1 - k))
        ctx.fillStyle = p.color
        ctx.globalAlpha = 1 - k
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)
      } else {
        p.vx *= 0.97
        ctx.globalAlpha = 0.28 * (1 - k)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 + k * 2.2), 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
  }

  function drawPlanet(t: number) {
    const cx = w * 0.84
    const cy = h * 0.4
    const r = kf(t, [0, 0.85, 1], [h * 0.03, h * 0.16, h * 0.26], ['in', 'in'])
    const glow = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 2.4)
    glow.addColorStop(0, rgba(accent, 0.25))
    glow.addColorStop(1, rgba(accent, 0))
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2)
    ctx.fill()

    const body = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r)
    body.addColorStop(0, rgba(accent, 1))
    body.addColorStop(0.7, rgba(accent, 0.55))
    body.addColorStop(1, 'rgba(16,16,19,0.95)')
    ctx.fillStyle = body
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    if (opts.ringed) {
      ctx.strokeStyle = rgba(accent, 0.7)
      ctx.lineWidth = Math.max(1.5, r * 0.06)
      ctx.beginPath()
      ctx.ellipse(cx, cy, r * 1.7, r * 0.42, -0.35, 0, Math.PI * 2)
      ctx.stroke()
    }
    if (opts.planetLabel && r > 26) {
      ctx.fillStyle = 'rgba(9,9,11,0.75)'
      ctx.font = `${Math.round(Math.min(48, r * 0.55) / 8) * 8}px Silkscreen, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(opts.planetLabel, cx, cy + 2)
    }
  }

  function drawLaunchPad(padTop: number, cx: number, P: number) {
    ctx.fillStyle = '#26272D'
    ctx.fillRect(cx - P * 9, padTop, P * 18, P * 1.5)
    ctx.fillStyle = '#3A3B42'
    ctx.fillRect(cx - P * 7, padTop + P * 1.5, P * 1.2, h)
    ctx.fillRect(cx + P * 5.8, padTop + P * 1.5, P * 1.2, h)
    // scaffold tower
    ctx.fillStyle = '#2E2F36'
    const tx = cx - P * 13
    ctx.fillRect(tx, padTop - P * 16, P * 1.2, P * 16)
    ctx.fillRect(tx + P * 3, padTop - P * 16, P * 1.2, P * 16)
    for (let i = 0; i < 6; i++) ctx.fillRect(tx, padTop - P * 16 + i * P * 3, P * 4.2, P * 0.6)
  }

  function drawRidge(top: number, landX: number) {
    const pts: Array<[number, number]> = [
      [0, top + h * 0.2],
      [w * 0.18, top + h * 0.08],
      [w * 0.34, top + h * 0.15],
      [w * 0.5, top + h * 0.03],
      [landX - w * 0.07, top],
      [landX + w * 0.07, top],
      [w * 0.82, top + h * 0.06],
      [w, top + h * 0.12],
    ]
    ctx.fillStyle = '#0E1411'
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (const [x, y] of pts) ctx.lineTo(x, y)
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = rgba(accent, 0.7)
    ctx.lineWidth = 2
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.stroke()
  }

  let smokeEmitted = 0
  let dustDone = false

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const t = Math.min(1, (now - start) / durationMs)
    const P = Math.max(4, Math.round(Math.min(w, h) / 118))

    ctx.fillStyle = '#09090B'
    ctx.fillRect(0, 0, w, h)
    drawStars(dt, starSpeed(t))

    if (kind === 'warp') {
      drawPlanet(t)
      const x = kf(t, [0, 0.3, 0.72, 1], [-0.1, 0.26, 0.54, 0.84]) * w
      const y = kf(t, [0, 0.3, 0.72, 1], [0.7, 0.6, 0.52, 0.41]) * h
      const wobble = Math.sin(now / 160) * 0.03
      const angle = (kf(t, [0, 0.3, 0.72, 1], [74, 84, 82, 70]) * Math.PI) / 180 + wobble
      const scale = kf(t, [0, 0.78, 1], [1, 1, 0.2], ['linear', 'in'])
      const n = nozzle(x, y, P, angle, scale)
      emitExhaust(n, Math.round(4 * scale) + 1, 520 * scale)
      drawParticles(dt)
      drawRocket(x, y, P, angle, scale, true, now)
    } else if (kind === 'launch') {
      const cx = w * 0.64
      const restY = h * 0.56
      const y = kf(t, [0, 0.36, 1], [restY, restY, -h * 0.35], ['linear', 'in'])
      const shake = t > 0.08 && t < 0.42 ? Math.sin(now / 18) * P * 0.35 : 0
      const padTop = restY + (BODY.length * P) / 2 + P * 0.5 + kf(t, [0.4, 1], [0, h * 0.7], ['in'])
      drawLaunchPad(padTop, cx, P)
      if (t > 0.12 && t < 0.62) {
        const want = Math.floor((t - 0.12) * 120)
        if (want > smokeEmitted) {
          emitSmoke(cx, restY + (BODY.length * P) / 2 + P * 2, 3)
          smokeEmitted = want
        }
      }
      const n = nozzle(cx + shake, y, P, 0, 1)
      if (t > 0.1) emitExhaust(n, t > 0.36 ? 6 : 2, t > 0.36 ? 700 : 260)
      if (t > 0.28 && t < 0.62) {
        const g = ctx.createRadialGradient(cx, padTop, 4, cx, padTop, P * 20)
        g.addColorStop(0, 'rgba(245,168,60,0.35)')
        g.addColorStop(1, 'rgba(245,168,60,0)')
        ctx.fillStyle = g
        ctx.fillRect(cx - P * 20, padTop - P * 20, P * 40, P * 40)
      }
      drawParticles(dt)
      drawRocket(cx + shake, y, P, 0, 1, t > 0.1, now)
    } else {
      const landX = w * 0.66
      const bodyHalf = (BODY.length * P) / 2
      const groundY = h * 0.64
      const ridgeTop = groundY + kf(t, [0, 0.62], [h * 0.5, 0], ['out'])
      const y = kf(t, [0, 0.58, 0.82], [-h * 0.25, groundY - bodyHalf - P * 6, groundY - bodyHalf], ['out', 'smooth'])
      const sway = t < 0.8 ? Math.sin(now / 220) * 0.04 : 0
      drawRidge(ridgeTop, landX)
      const n = nozzle(landX, y, P, sway, 1)
      const firing = t < 0.82
      if (firing) emitExhaust(n, t > 0.5 ? 4 : 2, t > 0.5 ? 380 : 180)
      if (t >= 0.82 && !dustDone) {
        emitSmoke(landX, groundY, 18)
        dustDone = true
      }
      drawParticles(dt)
      drawRocket(landX, y, P, sway, 1, firing, now)
    }
  }

  function drawStatic() {
    const P = Math.max(4, Math.round(Math.min(w, h) / 118))
    ctx.fillStyle = '#09090B'
    ctx.fillRect(0, 0, w, h)
    for (const s of stars) {
      ctx.fillStyle = `rgba(236,233,226,${0.2 + s.z * 0.5})`
      ctx.fillRect(s.x * w, s.y * h, 1.5, 1.5)
    }
    if (kind === 'warp') drawPlanet(0.9)
    drawRocket(w * 0.66, h * 0.5, P, kind === 'warp' ? Math.PI / 2.2 : 0, 1, false, 0)
  }

  return { frame, drawStatic, resize }
}
