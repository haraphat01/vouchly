import React from 'react'
import { colors } from '../theme'

const Star: React.FC<{ fill: number; size: number }> = ({ fill, size }) => (
  <div style={{ position: 'relative', width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute', inset: 0 }}>
      <path
        d="M12 2.5l2.9 6.32 6.85.66-5.2 4.7 1.55 6.82L12 17.77l-6.1 3.23 1.55-6.82-5.2-4.7 6.85-.66L12 2.5z"
        fill={colors.inkSubtle}
        opacity={0.5}
      />
    </svg>
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: `${fill * 100}%` }}>
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path
          d="M12 2.5l2.9 6.32 6.85.66-5.2 4.7 1.55 6.82L12 17.77l-6.1 3.23 1.55-6.82-5.2-4.7 6.85-.66L12 2.5z"
          fill={colors.brand}
        />
      </svg>
    </div>
  </div>
)

export const StarRow: React.FC<{ progress: number; size?: number; gap?: number }> = ({
  progress,
  size = 22,
  gap = 4,
}) => {
  const total = progress * 5
  return (
    <div style={{ display: 'flex', gap }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, total - i))
        return <Star key={i} fill={fill} size={size} />
      })}
    </div>
  )
}
