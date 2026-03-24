export type ScoredTestimonial = {
  status: string
  rating?: number | null
  type?: string
  submitter_role?: string | null
  submitter_company?: string | null
  content?: string | null
  created_at: string
}

export type ScoreDimension = {
  score: number
  max: number
  label: string
  icon: string
}

export type ScoreTip = {
  icon: string
  text: string
  impact: number
}

export type ProofScoreResult = {
  total: number
  grade: string
  gradeEmoji: string
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
  let grade: string, gradeEmoji: string
  if (total >= 81) { grade = 'Elite';    gradeEmoji = '💎' }
  else if (total >= 61) { grade = 'Strong'; gradeEmoji = '🔥' }
  else if (total >= 41) { grade = 'Building'; gradeEmoji = '⭐' }
  else if (total >= 21) { grade = 'Growing'; gradeEmoji = '📈' }
  else { grade = 'Starting'; gradeEmoji = '🌱' }

  const color = total >= 71 ? '#2e7d4f' : total >= 41 ? '#2980b9' : '#e8963a'

  // ── Tips ─────────────────────────────────────────────────────────────
  const tips: ScoreTip[] = []

  // Volume tip
  if (volumeScore < 25) {
    const next = n < 1 ? 1 : n < 3 ? 3 : n < 6 ? 6 : n < 11 ? 11 : 21
    const needed = next - n
    const nextScore = n < 1 ? 7 : n < 3 ? 12 : n < 6 ? 17 : n < 11 ? 21 : 25
    const gain = nextScore - volumeScore
    tips.push({
      icon: '📬',
      text: `Collect ${needed} more testimonial${needed > 1 ? 's' : ''} to earn +${gain} pts`,
      impact: gain,
    })
  }

  // Recency tip
  if (n === 0) {
    tips.push({ icon: '🚀', text: 'Collect your first testimonial to start your Proof Score', impact: 20 })
  } else if (recencyScore < 16) {
    const gain = 16 - recencyScore
    tips.push({ icon: '📅', text: `No new testimonials in 30+ days — share your link to stay fresh (+${gain} pts)`, impact: gain })
  }

  // Rating tip
  if (rated.length === 0) {
    tips.push({ icon: '⭐', text: 'Ask customers to add a star rating — it can add up to +10 pts', impact: 10 })
  } else if (ratingScore < 20) {
    const avg = rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length
    tips.push({ icon: '⭐', text: `Average rating is ${avg.toFixed(1)}★ — more 5★ reviews could add +${20 - ratingScore} pts`, impact: 20 - ratingScore })
  }

  // Diversity tip
  if (diversityScore < 15) {
    const needed = uniqueCount < 1 ? 1 : uniqueCount < 3 ? 3 - uniqueCount : 6 - uniqueCount
    tips.push({
      icon: '🎭',
      text: `Get ${needed} more reviewer${needed > 1 ? 's' : ''} with different roles or companies (+${15 - diversityScore} pts)`,
      impact: 15 - diversityScore,
    })
  }

  // Video tip
  if (videoScore < 5) {
    tips.push({ icon: '🎥', text: 'Add 1 video testimonial for a big credibility boost (+5 pts)', impact: 5 })
  } else if (videoScore < 10) {
    tips.push({ icon: '🎥', text: `Grow video testimonials to 40%+ of total for max score (+${10 - videoScore} pts)`, impact: 10 - videoScore })
  }

  // Depth tip
  if (depthScore < 10 && textOnes.length > 0) {
    tips.push({ icon: '✍️', text: `Prompt customers for more detail — aim for 60+ words (+${10 - depthScore} pts)`, impact: 10 - depthScore })
  }

  tips.sort((a, b) => b.impact - a.impact)

  return {
    total,
    grade,
    gradeEmoji,
    color,
    dimensions: [
      { score: volumeScore,   max: 25, label: 'Volume',    icon: '📬' },
      { score: recencyScore,  max: 20, label: 'Recency',   icon: '📅' },
      { score: ratingScore,   max: 20, label: 'Ratings',   icon: '⭐' },
      { score: diversityScore,max: 15, label: 'Diversity', icon: '🎭' },
      { score: videoScore,    max: 10, label: 'Video',     icon: '🎥' },
      { score: depthScore,    max: 10, label: 'Depth',     icon: '✍️' },
    ],
    tips: tips.slice(0, 3),
  }
}
