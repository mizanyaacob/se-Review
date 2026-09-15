import { ArrowRightLeft, CircleCheck, GraduationCap, Mountain, Presentation, RefreshCw, School, Trophy, Users, Wrench, Lock, type LucideIcon } from 'lucide-react'
import type { AchievementIcon } from '../../data/selfEvaluation'
import { hexA, mixHex } from '../../lib/utils'

export const achievementIcons: Record<AchievementIcon, LucideIcon> = {
  migration: ArrowRightLeft,
  courses: GraduationCap,
  tools: Wrench,
  rebuild: RefreshCw,
  trophy: Trophy,
  sessions: Presentation,
  team: Users,
  summit: Mountain,
  build: CircleCheck,
  outreach: School,
}

const HEX = 'polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)'

/** Hexagonal badge, like a platform achievement icon. */
export function AchievementBadge({ icon, accent, size = 56, locked = false }: { icon: AchievementIcon; accent: string; size?: number; locked?: boolean }) {
  const Icon = locked ? Lock : achievementIcons[icon]
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size * 0.9 }}>
      <span className="absolute inset-0" style={{ clipPath: HEX, background: locked ? 'rgba(255,255,255,0.12)' : accent }} />
      <span
        className="absolute inset-[2px]"
        style={{
          clipPath: HEX,
          background: locked ? '#141418' : `linear-gradient(160deg, ${mixHex(accent, '#101013', 0.45)}, ${mixHex(accent, '#101013', 0.12)})`,
          boxShadow: `inset 0 0 18px ${hexA(accent, 0.35)}`,
        }}
      />
      <Icon size={size * 0.4} strokeWidth={1.7} className="relative" style={{ color: locked ? '#5D5F67' : '#ECE9E2' }} />
    </span>
  )
}
