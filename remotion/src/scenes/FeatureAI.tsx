import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontBody, fontDisplay } from '../theme'
import { Kicker } from '../components/Kicker'
import { Copy } from '../copy'
import { useEdgeFade } from '../useEdgeFade'
import { Sfx } from '../components/Sfx'

const Sparkle: React.FC<{ x: number; y: number; delay: number; size: number }> = ({
  x,
  y,
  delay,
  size,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame: frame - delay, fps, config: { damping: 10, mass: 0.4 } })
  const scale = interpolate(s, [0, 0.6, 1], [0, 1.2, 0.9]);
  const opacity = interpolate(frame - delay, [0, 6, 26, 40], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 0l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" fill={colors.brand} />
      </svg>
    </div>
  )
}

export const FeatureAI: React.FC<{ copy: Copy; durationInFrames: number }> = ({
  copy,
  durationInFrames,
}) => {
  const opacity = useEdgeFade(durationInFrames)
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headS = spring({ frame: frame - 4, fps, config: { damping: 200 } })
  const beforeOpacity = interpolate(frame, [18, 30, 58, 70], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const afterS = spring({ frame: frame - 78, fps, config: { damping: 18, mass: 0.6 } })

  return (
    <AbsoluteFill
      style={{
        background: colors.paper,
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        padding: '0 80px',
      }}
    >
      <Sfx file="whoosh.wav" startFrame={58} volume={0.35} />
      <div style={{ opacity: interpolate(headS, [0, 1], [0, 1]) }}>
        <Kicker>{copy.feature2Kicker}</Kicker>
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
        {copy.feature2Headline}
      </div>

      <div
        style={{
          marginTop: 46,
          width: 620,
          minHeight: 220,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            fontFamily: fontBody,
            fontStyle: 'italic',
            fontSize: 32,
            color: colors.inkSubtle,
            opacity: beforeOpacity,
          }}
        >
          {copy.feature2Before}
        </div>

        <Sparkle x={260} y={30} delay={62} size={40} />
        <Sparkle x={320} y={90} delay={70} size={24} />
        <Sparkle x={230} y={110} delay={76} size={18} />

        <div
          style={{
            position: 'absolute',
            width: '100%',
            background: colors.white,
            borderRadius: 20,
            padding: '30px 34px',
            boxShadow: '0 24px 60px rgba(26,23,19,0.14)',
            borderLeft: `6px solid ${colors.brand}`,
            opacity: interpolate(afterS, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(afterS, [0, 1], [24, 0])}px) scale(${interpolate(afterS, [0, 1], [0.96, 1])})`,
          }}
        >
          <div style={{ fontFamily: fontBody, fontSize: 27, color: colors.ink, lineHeight: 1.5 }}>
            {copy.feature2After}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
