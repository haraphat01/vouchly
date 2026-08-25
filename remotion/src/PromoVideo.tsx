import React from 'react'
import { AbsoluteFill, Audio, Series, staticFile } from 'remotion'
import { COPY, Locale } from './copy'
import { Hook } from './scenes/Hook'
import { Brand } from './scenes/Brand'
import { FeatureCollect } from './scenes/FeatureCollect'
import { FeatureAI } from './scenes/FeatureAI'
import { FeatureEmbed } from './scenes/FeatureEmbed'
import { Stats } from './scenes/Stats'
import { Cta } from './scenes/Cta'

export const DURATIONS = {
  hook: 150,
  brand: 120,
  collect: 150,
  ai: 150,
  embed: 150,
  stats: 90,
  cta: 90,
}

export const TOTAL_DURATION = Object.values(DURATIONS).reduce((a, b) => a + b, 0)

export const PromoVideo: React.FC<{ locale: Locale }> = ({ locale }) => {
  const copy = COPY[locale]

  return (
    <AbsoluteFill style={{ backgroundColor: '#fdf8f0' }}>
      <Audio src={staticFile('audio/bg-music.wav')} volume={0.55} />
      <Series>
        <Series.Sequence durationInFrames={DURATIONS.hook}>
          <Hook copy={copy} durationInFrames={DURATIONS.hook} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.brand}>
          <Brand copy={copy} durationInFrames={DURATIONS.brand} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.collect}>
          <FeatureCollect copy={copy} durationInFrames={DURATIONS.collect} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.ai}>
          <FeatureAI copy={copy} durationInFrames={DURATIONS.ai} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.embed}>
          <FeatureEmbed copy={copy} durationInFrames={DURATIONS.embed} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.stats}>
          <Stats copy={copy} durationInFrames={DURATIONS.stats} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.cta}>
          <Cta copy={copy} durationInFrames={DURATIONS.cta} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  )
}
