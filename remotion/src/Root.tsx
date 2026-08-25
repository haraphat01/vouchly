import React from 'react'
import { Composition } from 'remotion'
import { PromoVideo, TOTAL_DURATION } from './PromoVideo'

const FPS = 30
const WIDTH = 1080
const HEIGHT = 1350

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoEN"
        component={PromoVideo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ locale: 'en' }}
      />
      <Composition
        id="PromoFR"
        component={PromoVideo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ locale: 'fr' }}
      />
      <Composition
        id="PromoES"
        component={PromoVideo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ locale: 'es' }}
      />
      <Composition
        id="PromoDE"
        component={PromoVideo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ locale: 'de' }}
      />
    </>
  )
}
