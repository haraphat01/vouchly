import React from 'react'
import { fontDisplay } from '../theme'

const PALETTE = ['#d4751f', '#8a6d3b', '#b5533c', '#6d7a5a', '#c99a4a']

export const Avatar: React.FC<{ initial: string; size?: number; index?: number }> = ({
  initial,
  size = 40,
  index = 0,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: PALETTE[index % PALETTE.length],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #fdf8f0',
      flexShrink: 0,
    }}
  >
    <span
      style={{
        fontFamily: fontDisplay,
        fontWeight: 600,
        fontSize: size * 0.42,
        color: '#fff',
      }}
    >
      {initial}
    </span>
  </div>
)
