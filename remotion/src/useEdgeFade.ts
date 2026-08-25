import { interpolate, useCurrentFrame } from 'remotion'

export const useEdgeFade = (durationInFrames: number, edge = 12) => {
  const frame = useCurrentFrame()
  return interpolate(
    frame,
    [0, edge, durationInFrames - edge, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
}
