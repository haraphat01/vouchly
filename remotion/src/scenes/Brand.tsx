import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontBody } from '../theme'
import { LogoMark, Wordmark } from '../components/Logo'
import { Copy } from '../copy'
import { useEdgeFade } from '../useEdgeFade'
import { Sfx } from '../components/Sfx'

export const Brand: React.FC<{ copy: Copy; durationInFrames: number }> = ({
  copy,
  durationInFrames,
}) => {
  const opacity = useEdgeFade(durationInFrames)
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const logoScale = spring({ frame, fps, config: { damping: 12, mass: 0.5 } })
  const wordOpacity = interpolate(
    spring({ frame: frame - 8, fps, config: { damping: 200 } }),
    [0, 1],
    [0, 1],
  )
  const taglineS = spring({ frame: frame - 22, fps, config: { damping: 200 } })
  const taglineOpacity = interpolate(taglineS, [0, 1], [0, 1])
  const taglineY = interpolate(taglineS, [0, 1], [16, 0])

  return (
    <AbsoluteFill
      style={{
        background: colors.paper,
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        padding: '0 100px',
      }}
    >
      <Sfx file="pop.wav" startFrame={0} volume={0.5} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <LogoMark size={88} scale={logoScale} />
        <div style={{ opacity: wordOpacity }}>
          <Wordmark fontSize={72} />
        </div>
      </div>
      <div
        style={{
          marginTop: 34,
          fontFamily: fontBody,
          fontSize: 34,
          textAlign: 'center',
          color: colors.inkMuted,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          maxWidth: 780,
          lineHeight: 1.4,
        }}
      >
        {copy.brandTagline}
      </div>
    </AbsoluteFill>
  )
}
