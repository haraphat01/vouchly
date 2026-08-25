import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontDisplay } from '../theme'
import { Copy } from '../copy'
import { useEdgeFade } from '../useEdgeFade'
import { Sfx } from '../components/Sfx'

const Line: React.FC<{
  text: string
  delay: number
  color: string
  fontSize: number
}> = ({ text, delay, color, fontSize }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.6 } })
  const opacity = interpolate(s, [0, 1], [0, 1])
  const y = interpolate(s, [0, 1], [24, 0])

  return (
    <div
      style={{
        fontFamily: fontDisplay,
        fontWeight: 700,
        fontSize,
        lineHeight: 1.18,
        color,
        opacity,
        transform: `translateY(${y}px)`,
        letterSpacing: '-0.01em',
      }}
    >
      {text}
    </div>
  )
}

export const Hook: React.FC<{ copy: Copy; durationInFrames: number }> = ({
  copy,
  durationInFrames,
}) => {
  const opacity = useEdgeFade(durationInFrames)
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const underline = spring({ frame: frame - 55, fps, config: { damping: 200 } })

  return (
    <AbsoluteFill
      style={{
        background: colors.ink,
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '0 90px',
        opacity,
      }}
    >
      <Sfx file="whoosh.wav" startFrame={0} volume={0.3} />
      <Line text={copy.hookLine1} delay={4} color={colors.inkSubtle} fontSize={58} />
      <div style={{ height: 22 }} />
      <Line text={copy.hookLine2} delay={40} color={colors.paper} fontSize={64} />
      <div
        style={{
          marginTop: 26,
          height: 6,
          width: interpolate(underline, [0, 1], [0, 180]),
          background: colors.brand,
          borderRadius: 3,
        }}
      />
    </AbsoluteFill>
  )
}
