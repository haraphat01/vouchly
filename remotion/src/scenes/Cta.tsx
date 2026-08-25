import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontBody, fontDisplay } from '../theme'
import { LogoMark } from '../components/Logo'
import { Copy } from '../copy'
import { Sfx } from '../components/Sfx'

export const Cta: React.FC<{ copy: Copy; durationInFrames: number }> = ({ copy }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const enter = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const logoScale = spring({ frame, fps, config: { damping: 12, mass: 0.5 } })
  const headS = spring({ frame: frame - 10, fps, config: { damping: 200 } })
  const btnS = spring({ frame: frame - 24, fps, config: { damping: 14, mass: 0.6 } })
  const btnPulse = 1 + Math.sin(frame / 6) * 0.02

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${colors.brand} 0%, #b25f16 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: enter,
        padding: '0 80px',
      }}
    >
      <Sfx file="chime.wav" startFrame={24} volume={0.55} />
      <div style={{ transform: `scale(${logoScale})` }}>
        <LogoMark size={80} />
      </div>

      <div
        style={{
          marginTop: 30,
          fontFamily: fontDisplay,
          fontWeight: 700,
          fontSize: 58,
          color: colors.white,
          textAlign: 'center',
          opacity: interpolate(headS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(headS, [0, 1], [16, 0])}px)`,
        }}
      >
        {copy.ctaHeadline}
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: fontBody,
          fontSize: 26,
          color: colors.brandLight,
          textAlign: 'center',
          opacity: interpolate(headS, [0, 1], [0, 1]),
        }}
      >
        {copy.ctaSub}
      </div>

      <div
        style={{
          marginTop: 40,
          padding: '20px 44px',
          borderRadius: 14,
          background: colors.white,
          opacity: interpolate(btnS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(btnS, [0, 1], [20, 0])}px) scale(${interpolate(btnS, [0, 1], [0.9, btnPulse])})`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        }}
      >
        <span style={{ fontFamily: fontBody, fontWeight: 600, fontSize: 28, color: colors.brand }}>
          {copy.ctaButton}
        </span>
      </div>

      <div
        style={{
          marginTop: 26,
          fontFamily: fontBody,
          fontSize: 22,
          letterSpacing: '0.04em',
          color: colors.brandLight,
          opacity: interpolate(btnS, [0, 1], [0, 1]),
        }}
      >
        {copy.ctaUrl}
      </div>
    </AbsoluteFill>
  )
}
