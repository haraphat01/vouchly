import type { LucideIcon } from 'lucide-react'
import {
  Inbox,
  CalendarClock,
  Star,
  Users,
  Video,
  PenLine,
  Rocket,
  Gem,
  Flame,
  TrendingUp,
  Sprout,
} from 'lucide-react'
import type {
  ProofScoreDimensionIconKey,
  ProofScoreGradeIconKey,
  ProofScoreTipIconKey,
} from '@/lib/proofScore'

const STROKE = 1.5

const DIMENSION_MAP: Record<ProofScoreDimensionIconKey, LucideIcon> = {
  volume: Inbox,
  recency: CalendarClock,
  ratings: Star,
  diversity: Users,
  video: Video,
  depth: PenLine,
}

const TIP_MAP: Record<ProofScoreTipIconKey, LucideIcon> = {
  inbox: Inbox,
  rocket: Rocket,
  calendar: CalendarClock,
  star: Star,
  users: Users,
  video: Video,
  'pen-line': PenLine,
}

const GRADE_MAP: Record<ProofScoreGradeIconKey, LucideIcon> = {
  gem: Gem,
  flame: Flame,
  star: Star,
  'trending-up': TrendingUp,
  sprout: Sprout,
}

export function ProofDimensionIcon({
  name,
  size = 14,
  color,
}: {
  name: ProofScoreDimensionIconKey
  size?: number
  color?: string
}) {
  const Icon = DIMENSION_MAP[name]
  return (
    <Icon
      size={size}
      strokeWidth={STROKE}
      aria-hidden
      style={{ display: 'block', flexShrink: 0, color: color ?? 'var(--ink-muted)' }}
    />
  )
}

export function ProofTipIcon({
  name,
  size = 15,
  color,
}: {
  name: ProofScoreTipIconKey
  size?: number
  color?: string
}) {
  const Icon = TIP_MAP[name]
  return (
    <Icon
      size={size}
      strokeWidth={STROKE}
      aria-hidden
      style={{ display: 'block', flexShrink: 0, color: color ?? 'var(--ink-muted)' }}
    />
  )
}

export function ProofGradeIcon({
  name,
  size = 14,
  color,
}: {
  name: ProofScoreGradeIconKey
  size?: number
  color?: string
}) {
  const Icon = GRADE_MAP[name]
  return (
    <Icon
      size={size}
      strokeWidth={STROKE}
      aria-hidden
      style={{ display: 'block', flexShrink: 0, color }}
    />
  )
}
