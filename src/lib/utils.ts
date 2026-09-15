export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

/** '#rrggbb' + alpha → 'rgba(r, g, b, a)' */
export function hexA(hex: string, alpha: number) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/** Opaque blend of `hex` over `base` — for fills that must hide lines drawn beneath them. */
export function mixHex(hex: string, base: string, amount: number) {
  const parse = (h: string) => {
    const n = parseInt(h.replace('#', ''), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const a = parse(hex)
  const b = parse(base)
  const c = a.map((v, i) => Math.round(b[i] + (v - b[i]) * amount))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

export const pad2 = (n: number) => String(n).padStart(2, '0')

export const EASE_OUT = [0.16, 1, 0.3, 1] as const

export const COLORS = {
  paper: '#ECE9E2',
  dim: '#9A9BA3',
  faint: '#5D5F67',
  ink: '#09090B',
  ink2: '#101013',
  line: 'rgba(255,255,255,0.08)',
  line2: 'rgba(255,255,255,0.14)',
  ok: '#5FE0A0',
  warn: '#F5A83C',
  alert: '#F28B82',
} as const
