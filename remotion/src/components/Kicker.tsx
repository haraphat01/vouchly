import React from 'react'
import { colors, fontBody } from '../theme'

export const Kicker: React.FC<{ children: React.ReactNode; opacity?: number }> = ({
  children,
  opacity = 1,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 18px',
      borderRadius: 999,
      background: colors.brandLight,
      opacity,
    }}
  >
    <div style={{ width: 6, height: 6, borderRadius: 3, background: colors.brand }} />
    <span
      style={{
        fontFamily: fontBody,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: '0.12em',
        color: colors.brand,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  </div>
)
