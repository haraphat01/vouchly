import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontBody, fontDisplay, fontMono } from '../theme'
import { Kicker } from '../components/Kicker'
import { StarRow } from '../components/Stars'
import { Avatar } from '../components/Avatar'
import { Copy } from '../copy'
import { useEdgeFade } from '../useEdgeFade'
import { Sfx } from '../components/Sfx'

const MiniCard: React.FC<{ delay: number; initial: string; index: number; lines: number }> = ({
  delay,
  initial,
  index,
  lines,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.6 } })
  return (
    <div
      style={{
        background: colors.white,
        borderRadius: 16,
        padding: '18px 20px',
        width: 240,
        boxShadow: '0 14px 34px rgba(26,23,19,0.12)',
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px) scale(${interpolate(s, [0, 1], [0.92, 1])})`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Avatar initial={initial} size={34} index={index} />
        <StarRow progress={1} size={13} gap={2} />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 9,
            borderRadius: 5,
            background: colors.paperDark,
            width: i === lines - 1 ? '60%' : '100%',
            marginTop: 7,
          }}
        />
      ))}
    </div>
  )
}

export const FeatureEmbed: React.FC<{ copy: Copy; durationInFrames: number }> = ({
  copy,
  durationInFrames,
}) => {
  const opacity = useEdgeFade(durationInFrames)
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headS = spring({ frame: frame - 4, fps, config: { damping: 200 } })
  const chipS = spring({ frame: frame - 18, fps, config: { damping: 16, mass: 0.5 } })
  const chipPulse = interpolate(frame, [40, 52, 64], [1, 1.06, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        background: colors.paperDark,
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        padding: '0 70px',
      }}
    >
      <Sfx file="whoosh.wav" startFrame={15} volume={0.3} />
      <Sfx file="pop.wav" startFrame={70} volume={0.32} />
      <Sfx file="pop.wav" startFrame={82} volume={0.28} />
      <Sfx file="pop.wav" startFrame={94} volume={0.28} />
      <div style={{ opacity: interpolate(headS, [0, 1], [0, 1]) }}>
        <Kicker>{copy.feature3Kicker}</Kicker>
      </div>
      <div
        style={{
          marginTop: 20,
          fontFamily: fontDisplay,
          fontWeight: 600,
          fontSize: 44,
          textAlign: 'center',
          color: colors.ink,
          lineHeight: 1.22,
          maxWidth: 760,
          opacity: interpolate(headS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(headS, [0, 1], [14, 0])}px)`,
        }}
      >
        {copy.feature3Headline}
      </div>

      <div
        style={{
          marginTop: 30,
          padding: '12px 22px',
          borderRadius: 12,
          background: colors.ink,
          opacity: interpolate(chipS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(chipS, [0, 1], [16, 0])}px) scale(${chipPulse})`,
        }}
      >
        <span style={{ fontFamily: fontMono, fontSize: 20, color: colors.brandLight }}>
          {copy.feature3Snippet}
        </span>
      </div>

      <div style={{ marginTop: 34, display: 'flex', gap: 20 }}>
        <MiniCard delay={70} initial="S" index={0} lines={3} />
        <MiniCard delay={82} initial="M" index={1} lines={2} />
        <MiniCard delay={94} initial="P" index={2} lines={3} />
      </div>
    </AbsoluteFill>
  )
}
