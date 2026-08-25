import React from 'react'
import { colors, fontDisplay } from '../theme'

export const LogoMark: React.FC<{ size?: number; scale?: number }> = ({ size = 64, scale = 1 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: colors.brand,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${scale})`,
      boxShadow: '0 10px 30px rgba(212,117,31,0.35)',
    }}
  >
    <span
      style={{
        fontFamily: fontDisplay,
        fontWeight: 700,
        fontSize: size * 0.58,
        color: colors.white,
        lineHeight: 1,
        marginTop: size * 0.04,
      }}
    >
      v
    </span>
  </div>
)

export const Wordmark: React.FC<{ fontSize?: number; color?: string }> = ({
  fontSize = 48,
  color = colors.ink,
}) => (
  <span
    style={{
      fontFamily: fontDisplay,
      fontWeight: 600,
      fontSize,
      color,
      letterSpacing: '-0.01em',
    }}
  >
    vouchly
  </span>
)
