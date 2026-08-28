export type ScoredTestimonial = {
  status: string
  rating?: number | null
  type?: string
  submitter_role?: string | null
  submitter_company?: string | null
  content?: string | null
  created_at: string
}

export type ProofScoreDimensionIconKey =
  | 'volume'
  | 'recency'
  | 'ratings'
  | 'diversity'
  | 'video'
  | 'depth'

export type ProofScoreTipIconKey =
  | 'inbox'
  | 'rocket'
  | 'calendar'
  | 'star'
  | 'users'
  | 'video'
  | 'pen-line'

export type ProofScoreGradeIconKey = 'gem' | 'flame' | 'star' | 'trending-up' | 'sprout'

export type ScoreDimension = {
  score: number
  max: number
  icon: ProofScoreDimensionIconKey
}

export type ScoreTipKey =
  | 'volume'
  | 'first'
  | 'recency'
  | 'rating_none'
  | 'rating_low'
  | 'diversity'
  | 'video_none'
  | 'video_low'
  | 'depth'

export type ScoreTip = {
  icon: ProofScoreTipIconKey
  key: ScoreTipKey
  values?: Record<string, number>
  impact: number
}

export type ProofScoreGradeKey = 'elite' | 'strong' | 'building' | 'growing' | 'starting'

export type ProofScoreResult = {
  total: number
  gradeKey: ProofScoreGradeKey
  gradeIcon: ProofScoreGradeIconKey
  color: string
  dimensions: ScoreDimension[]
  tips: ScoreTip[]
}

export function calculateProofScore(testimonials: ScoredTestimonial[]): ProofScoreResult {
  const approved = testimonials.filter(t => t.status === 'approved')
  const n = approved.length

  // ── 1. Volume (0–25) ────────────────────────────────────────────────
  let volumeScore = 0
  if (n >= 21) volumeScore = 25
  else if (n >= 11) volumeScore = 21
  else if (n >= 6) volumeScore = 17
  else if (n >= 3) volumeScore = 12
  else if (n >= 1) volumeScore = 7

  // ── 2. Recency (0–20) ───────────────────────────────────────────────
  let recencyScore = 0
  if (n > 0) {
    const latest = Math.max(...approved.map(t => new Date(t.created_at).getTime()))
    const daysSince = (Date.now() - latest) / 86_400_000
    if (daysSince <= 7) recencyScore = 20
    else if (daysSince <= 30) recencyScore = 16
    else if (daysSince <= 90) recencyScore = 10
    else if (daysSince <= 180) recencyScore = 5
    else recencyScore = 2
  }

  // ── 3. Star rating average (0–20) ───────────────────────────────────
  const rated = approved.filter(t => t.rating)
  let ratingScore = 10 // neutral when no ratings
  if (rated.length > 0) {
    const avg = rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length
    if (avg >= 4.5) ratingScore = 20
    else if (avg >= 4.0) ratingScore = 15
    else if (avg >= 3.5) ratingScore = 10
    else if (avg >= 3.0) ratingScore = 5
    else ratingScore = 0
  }

  // ── 4. Role/company diversity (0–15) ────────────────────────────────
  const identities = new Set(
    approved
      .map(t => [t.submitter_role, t.submitter_company].filter(Boolean).join('|'))
      .filter(s => s.length > 0)
  )
  const uniqueCount = identities.size
  let diversityScore = 0
  if (uniqueCount >= 6) diversityScore = 15
  else if (uniqueCount >= 3) diversityScore = 10
  else if (uniqueCount >= 1) diversityScore = 5

  // ── 5. Video presence (0–10) ────────────────────────────────────────
  const videos = approved.filter(t => t.type === 'video')
  const videoRatio = n > 0 ? videos.length / n : 0
  let videoScore = 0
  if (videoRatio >= 0.4) videoScore = 10
  else if (videoRatio >= 0.2) videoScore = 7
  else if (videos.length >= 1) videoScore = 5

  // ── 6. Content depth (0–10) ─────────────────────────────────────────
  const textOnes = approved.filter(t => t.content?.trim())
  let depthScore = 5 // neutral if no text
  if (textOnes.length > 0) {
    const avgWords =
      textOnes.reduce((s, t) => s + t.content!.trim().split(/\s+/).filter(Boolean).length, 0) /
      textOnes.length
    if (avgWords >= 60) depthScore = 10
    else if (avgWords >= 40) depthScore = 7
    else if (avgWords >= 20) depthScore = 5
    else depthScore = 2
  }

  const total = Math.min(100, volumeScore + recencyScore + ratingScore + diversityScore + videoScore + depthScore)

  // ── Grade ────────────────────────────────────────────────────────────
  let gradeKey: ProofScoreGradeKey, gradeIcon: ProofScoreGradeIconKey
  if (total >= 81) { gradeKey = 'elite'; gradeIcon = 'gem' }
  else if (total >= 61) { gradeKey = 'strong'; gradeIcon = 'flame' }
  else if (total >= 41) { gradeKey = 'building'; gradeIcon = 'star' }
  else if (total >= 21) { gradeKey = 'growing'; gradeIcon = 'trending-up' }
  else { gradeKey = 'starting'; gradeIcon = 'sprout' }

  const color = total >= 71 ? '#2e7d4f' : total >= 41 ? '#2980b9' : '#e8963a'

  // ── Tips ─────────────────────────────────────────────────────────────
  const tips: ScoreTip[] = []

  // Volume tip
  if (volumeScore < 25) {
    const next = n < 1 ? 1 : n < 3 ? 3 : n < 6 ? 6 : n < 11 ? 11 : 21
    const needed = next - n
    const nextScore = n < 1 ? 7 : n < 3 ? 12 : n < 6 ? 17 : n < 11 ? 21 : 25
    const gain = nextScore - volumeScore
    tips.push({ icon: 'inbox', key: 'volume', values: { needed, gain }, impact: gain })
  }

  // Recency tip
  if (n === 0) {
    tips.push({ icon: 'rocket', key: 'first', impact: 20 })
  } else if (recencyScore < 16) {
    const gain = 16 - recencyScore
    tips.push({ icon: 'calendar', key: 'recency', values: { gain }, impact: gain })
  }

  // Rating tip
  if (rated.length === 0) {
    tips.push({ icon: 'star', key: 'rating_none', impact: 10 })
  } else if (ratingScore < 20) {
    const avg = rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length
    tips.push({ icon: 'star', key: 'rating_low', values: { avg: Math.round(avg * 10) / 10, gain: 20 - ratingScore }, impact: 20 - ratingScore })
  }

  // Diversity tip
  if (diversityScore < 15) {
    const needed = uniqueCount < 1 ? 1 : uniqueCount < 3 ? 3 - uniqueCount : 6 - uniqueCount
    tips.push({ icon: 'users', key: 'diversity', values: { needed, gain: 15 - diversityScore }, impact: 15 - diversityScore })
  }

  // Video tip
  if (videoScore < 5) {
    tips.push({ icon: 'video', key: 'video_none', impact: 5 })
  } else if (videoScore < 10) {
    tips.push({ icon: 'video', key: 'video_low', values: { gain: 10 - videoScore }, impact: 10 - videoScore })
  }

  // Depth tip
  if (depthScore < 10 && textOnes.length > 0) {
    tips.push({ icon: 'pen-line', key: 'depth', values: { gain: 10 - depthScore }, impact: 10 - depthScore })
  }

  tips.sort((a, b) => b.impact - a.impact)

  return {
    total,
    gradeKey,
    gradeIcon,
    color,
    dimensions: [
      { score: volumeScore, max: 25, icon: 'volume' },
      { score: recencyScore, max: 20, icon: 'recency' },
      { score: ratingScore, max: 20, icon: 'ratings' },
      { score: diversityScore, max: 15, icon: 'diversity' },
      { score: videoScore, max: 10, icon: 'video' },
      { score: depthScore, max: 10, icon: 'depth' },
    ],
    tips: tips.slice(0, 3),
  }
}
