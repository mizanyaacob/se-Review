import { useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

// 12 × 16 sprite. h hair · s skin · e eye · c hoodie · k headphones · p pants · b boots
const BODY = [
  '....hhhh....',
  '..khhhhhhk..',
  '..khhhhhhk..',
  '..kssssssk..',
  '...sessess..',
  '...ssssss...',
  '....ssss....',
  '..cccccccc..',
  '.cccccccccc.',
  '.sccccccccs.',
  '..cccccccc..',
  '..pppppppp..',
]
const LEGS = [
  ['..ppp..ppp..', '..ppp..ppp..', '..bbb..bbb..', '............'],
  ['.ppp....pp..', 'ppp.....ppp.', 'bbb......bbb', '............'],
]

interface PixelHeroProps {
  /** Hoodie colour, usually the current chapter accent. */
  accent: string
  walking?: boolean
  /** Pixel size in CSS px. */
  scale?: number
  facing?: 1 | -1
  className?: string
  /** Position when nested inside another SVG. */
  x?: number
  y?: number
}

/** A small pixel-art engineer (headphones, hoodie). Two-frame walk cycle while `walking`. */
export function PixelHero({ accent, walking = false, scale = 3, facing = 1, className, x, y }: PixelHeroProps) {
  const reduce = useReducedMotion()
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (!walking || reduce) {
      setFrame(0)
      return
    }
    const t = window.setInterval(() => setFrame((f) => (f + 1) % 2), 130)
    return () => window.clearInterval(t)
  }, [walking, reduce])

  const rows = [...BODY, ...LEGS[frame]]
  const palette: Record<string, string> = {
    h: '#23242B',
    s: '#E6BE94',
    e: '#101013',
    c: accent,
    k: '#ECE9E2',
    p: '#3A3D4D',
    b: '#15161B',
  }

  return (
    <svg
      aria-hidden
      className={className}
      x={x}
      y={y}
      width={12 * scale}
      height={16 * scale}
      viewBox="0 0 12 16"
      shapeRendering="crispEdges"
      style={{ transform: facing === -1 ? 'scaleX(-1)' : undefined, imageRendering: 'pixelated' }}
    >
      {rows.map((row, y) =>
        row.split('').map((ch, x) =>
          ch === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={palette[ch]} />,
        ),
      )}
    </svg>
  )
}
