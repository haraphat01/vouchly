import React from 'react'
import { Audio, Sequence, staticFile } from 'remotion'

export const Sfx: React.FC<{ file: string; startFrame?: number; volume?: number }> = ({
  file,
  startFrame = 0,
  volume = 0.6,
}) => (
  <Sequence from={startFrame} layout="none">
    <Audio src={staticFile(`audio/${file}`)} volume={volume} />
  </Sequence>
)
