import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontBody, fontDisplay } from '../theme'
import { Kicker } from '../components/Kicker'
import { StarRow } from '../components/Stars'
import { Copy } from '../copy'
import { useEdgeFade } from '../useEdgeFade'
import { Sfx } from '../components/Sfx'

export const FeatureCollect: React.FC<{ copy: Copy; durationInFrames: number }> = ({
  copy,
  durationInFrames,
}) => {
  const opacity = useEdgeFade(durationInFrames)
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headS = spring({ frame: frame - 4, fps, config: { damping: 200 } })
  const cardS = spring({ frame: frame - 18, fps, config: { damping: 16, mass: 0.6 } })
  const starProgress = interpolate(frame, [45, 85], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const pulse = 0.85 + Math.sin(frame / 5) * 0.15

  return (
    <AbsoluteFill
      style={{
        background: colors.paperDark,
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        padding: '0 80px',
      }}
    >
      <Sfx file="pop.wav" startFrame={18} volume={0.4} />
      <div style={{ opacity: interpolate(headS, [0, 1], [0, 1]) }}>
        <Kicker>{copy.feature1Kicker}</Kicker>
      </div>
      <div
        style={{
          marginTop: 20,
          fontFamily: fontDisplay,
          fontWeight: 600,
          fontSize: 46,
          textAlign: 'center',
          color: colors.ink,
          lineHeight: 1.22,
          maxWidth: 760,
          opacity: interpolate(headS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(headS, [0, 1], [14, 0])}px)`,
        }}
      >
        {copy.feature1Headline}
      </div>

      <div
        style={{
          marginTop: 44,
          width: 560,
          background: colors.white,
          borderRadius: 24,
          padding: '32px 36px',
          boxShadow: '0 24px 60px rgba(26,23,19,0.14)',
          opacity: interpolate(cardS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(cardS, [0, 1], [40, 0])}px) scale(${interpolate(cardS, [0, 1], [0.95, 1])})`,
        }}
      >
        <div style={{ fontFamily: fontBody, fontSize: 22, color: colors.inkMuted, marginBottom: 14 }}>
          {copy.feature1RatingLabel}
        </div>
        <StarRow progress={starProgress} size={34} gap={8} />

        <div
          style={{
            marginTop: 26,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 20px',
            borderRadius: 14,
            background: colors.brandLight,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: '#c0392b',
              opacity: pulse,
            }}
          />
          <span style={{ fontFamily: fontBody, fontSize: 22, color: colors.ink, fontWeight: 600 }}>
            {copy.feature1RecordingLabel}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
