import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontBody, fontDisplay } from '../theme'
import { Copy } from '../copy'
import { useEdgeFade } from '../useEdgeFade'
import { Sfx } from '../components/Sfx'

const Stat: React.FC<{ value: string; label: string; delay: number }> = ({
  value,
  label,
  delay,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame: frame - delay, fps, config: { damping: 9, mass: 0.5 } })
  return (
    <div
      style={{
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: fontDisplay,
          fontWeight: 700,
          fontSize: 84,
          color: colors.brand,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: fontBody,
          fontSize: 24,
          color: colors.inkSubtle,
        }}
      >
        {label}
      </div>
    </div>
  )
}

export const Stats: React.FC<{ copy: Copy; durationInFrames: number }> = ({
  copy,
  durationInFrames,
}) => {
  const opacity = useEdgeFade(durationInFrames)

  return (
    <AbsoluteFill
      style={{
        background: colors.ink,
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      <Sfx file="pop.wav" startFrame={0} volume={0.4} />
      <Sfx file="pop.wav" startFrame={10} volume={0.4} />
      <div style={{ display: 'flex', gap: 90 }}>
        <Stat value={copy.statValue1} label={copy.statLabel1} delay={0} />
        <Stat value={copy.statValue2} label={copy.statLabel2} delay={10} />
      </div>
    </AbsoluteFill>
  )
}
