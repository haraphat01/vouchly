// Procedurally synthesizes the ad's background music bed and UI-style SFX
// as raw PCM, written directly to WAV. No external audio assets/libraries.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'audio')
const SR = 44100

function writeWav(filePath, left, right) {
  const numFrames = left.length
  const blockAlign = 4 // 2 channels * 16-bit
  const dataSize = numFrames * blockAlign
  const buf = Buffer.alloc(44 + dataSize)

  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + dataSize, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(2, 22)
  buf.writeUInt32LE(SR, 24)
  buf.writeUInt32LE(SR * blockAlign, 28)
  buf.writeUInt16LE(blockAlign, 32)
  buf.writeUInt16LE(16, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(dataSize, 40)

  let o = 44
  for (let i = 0; i < numFrames; i++) {
    const l = Math.max(-1, Math.min(1, left[i]))
    const r = Math.max(-1, Math.min(1, right[i]))
    buf.writeInt16LE(Math.round(l * 32767), o)
    buf.writeInt16LE(Math.round(r * 32767), o + 2)
    o += 4
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, buf)
  console.log('wrote', filePath, `${(numFrames / SR).toFixed(2)}s`)
}

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12)

function makeBuffers(seconds) {
  const n = Math.ceil(seconds * SR)
  return { L: new Float32Array(n), R: new Float32Array(n) }
}

// smooth envelope helpers
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

function addSine(buf, startSample, freq, ampFn, durSec, opts = {}) {
  const { pan = 0, harmonic2 = 0, phase = 0 } = opts
  const nSamples = Math.floor(durSec * SR)
  const panL = Math.cos(((pan + 1) * Math.PI) / 4)
  const panR = Math.sin(((pan + 1) * Math.PI) / 4)
  for (let i = 0; i < nSamples; i++) {
    const t = i / SR
    const idx = startSample + i
    if (idx < 0 || idx >= buf.L.length) continue
    const amp = ampFn(t, durSec)
    let s = Math.sin(2 * Math.PI * freq * t + phase)
    if (harmonic2 > 0) s += harmonic2 * Math.sin(2 * Math.PI * freq * 2 * t + phase)
    s *= amp
    buf.L[idx] += s * panL
    buf.R[idx] += s * panR
  }
}

function addNoiseBurst(buf, startSample, durSec, ampFn, opts = {}) {
  const { pan = 0, smooth = 0.8 } = opts
  const nSamples = Math.floor(durSec * SR)
  const panL = Math.cos(((pan + 1) * Math.PI) / 4)
  const panR = Math.sin(((pan + 1) * Math.PI) / 4)
  let prevL = 0
  let prevR = 0
  for (let i = 0; i < nSamples; i++) {
    const t = i / SR
    const idx = startSample + i
    if (idx < 0 || idx >= buf.L.length) continue
    const amp = ampFn(t, durSec)
    const rawL = (Math.random() * 2 - 1) * amp
    const rawR = (Math.random() * 2 - 1) * amp
    prevL = prevL * smooth + rawL * (1 - smooth)
    prevR = prevR * smooth + rawR * (1 - smooth)
    buf.L[idx] += prevL * panL
    buf.R[idx] += prevR * panR
  }
}

function normalize(buf, targetPeak = 0.9) {
  let peak = 0
  for (let i = 0; i < buf.L.length; i++) {
    peak = Math.max(peak, Math.abs(buf.L[i]), Math.abs(buf.R[i]))
  }
  if (peak <= 0) return
  const scale = Math.min(targetPeak / peak, 4)
  for (let i = 0; i < buf.L.length; i++) {
    buf.L[i] *= scale
    buf.R[i] *= scale
  }
}

function applyFade(buf, fadeInSec, fadeOutSec) {
  const n = buf.L.length
  const inN = Math.floor(fadeInSec * SR)
  const outN = Math.floor(fadeOutSec * SR)
  for (let i = 0; i < inN; i++) {
    const g = easeInOut(i / inN)
    buf.L[i] *= g
    buf.R[i] *= g
  }
  for (let i = 0; i < outN; i++) {
    const g = easeInOut(i / outN)
    const idx = n - 1 - i
    buf.L[idx] *= g
    buf.R[idx] *= g
  }
}

// ---------------------------------------------------------------------------
// Background music bed — warm, upbeat, corporate-friendly. 30s, matches video.
// Progression: Cmaj7 - Am7 - Fmaj7 - G - Cmaj7 - Am7  (5s per chord)
// ---------------------------------------------------------------------------
function genBackgroundMusic() {
  const TOTAL = 30
  const buf = makeBuffers(TOTAL + 1)
  const BPM = 96
  const beat = 60 / BPM
  const eighth = beat / 2

  const chords = [
    { notes: [60, 64, 67, 71] }, // Cmaj7
    { notes: [57, 60, 64, 67] }, // Am7
    { notes: [53, 57, 60, 64] }, // Fmaj7
    { notes: [55, 59, 62, 67] }, // G
    { notes: [60, 64, 67, 71] }, // Cmaj7
    { notes: [57, 60, 64, 67] }, // Am7
  ]
  const chordDur = 5

  chords.forEach((chord, ci) => {
    const chordStart = ci * chordDur
    // Pad: slow attack/release, layered notes, gentle
    chord.notes.forEach((midi, ni) => {
      const freq = midiToFreq(midi - 12) // one octave down for warmth
      const startSample = Math.floor(chordStart * SR)
      addSine(
        buf,
        startSample,
        freq,
        (t, dur) => {
          const attack = 0.9
          const release = 1.1
          let env
          if (t < attack) env = easeInOut(t / attack)
          else if (t > dur - release) env = easeInOut(Math.max(0, (dur - t) / release))
          else env = 1
          return env * 0.045
        },
        chordDur + 0.2,
        { pan: ni % 2 === 0 ? -0.3 : 0.3, harmonic2: 0.18 },
      )
    })

    // Plucky arpeggio, eighth notes, ascending/descending pattern
    const pattern = [0, 1, 2, 3, 2, 1, 0, 1]
    const stepsInChord = Math.floor(chordDur / eighth)
    for (let s = 0; s < stepsInChord; s++) {
      const noteIdx = pattern[s % pattern.length]
      const midi = chord.notes[noteIdx] + 12 // octave up, bright pluck
      const freq = midiToFreq(midi)
      const startSample = Math.floor((chordStart + s * eighth) * SR)
      addSine(
        buf,
        startSample,
        freq,
        (t) => Math.exp(-t / 0.22) * 0.055,
        0.5,
        { pan: s % 2 === 0 ? 0.4 : -0.4, harmonic2: 0.25 },
      )
    }

    // Soft kick on beats 1 and 3 of each bar-ish (every other beat)
    const beatsInChord = Math.floor(chordDur / beat)
    for (let b = 0; b < beatsInChord; b += 2) {
      const startSample = Math.floor((chordStart + b * beat) * SR)
      const nSamples = Math.floor(0.18 * SR)
      for (let i = 0; i < nSamples; i++) {
        const t = i / SR
        const idx = startSample + i
        if (idx >= buf.L.length) continue
        const freq = 90 - t * 220 // quick pitch drop
        const env = Math.exp(-t / 0.09) * 0.16
        const s = Math.sin(2 * Math.PI * Math.max(freq, 35) * t) * env
        buf.L[idx] += s
        buf.R[idx] += s
      }
    }

    // Light shaker texture on off-beat eighths
    for (let s = 0; s < stepsInChord; s++) {
      if (s % 2 === 0) continue
      const startSample = Math.floor((chordStart + s * eighth) * SR)
      addNoiseBurst(buf, startSample, 0.045, (t) => Math.exp(-t / 0.015) * 0.035, {
        pan: s % 4 === 1 ? 0.5 : -0.5,
        smooth: 0.6,
      })
    }
  })

  applyFade(buf, 0.6, 1.3)
  normalize(buf, 0.5)
  writeWav(path.join(OUT_DIR, 'bg-music.wav'), buf.L, buf.R)
}

// ---------------------------------------------------------------------------
// SFX
// ---------------------------------------------------------------------------
function genWhoosh() {
  const buf = makeBuffers(0.55)
  addNoiseBurst(buf, 0, 0.5, (t) => Math.sin((t / 0.5) * Math.PI) * 0.35, { smooth: 0.55 })
  normalize(buf, 0.6)
  writeWav(path.join(OUT_DIR, 'whoosh.wav'), buf.L, buf.R)
}

function genChime() {
  const buf = makeBuffers(1.1)
  const notes = [72, 76, 79] // C5 E5 G5 bell arpeggio
  notes.forEach((midi, i) => {
    const start = Math.floor(i * 0.11 * SR)
    addSine(
      buf,
      start,
      midiToFreq(midi),
      (t) => Math.exp(-t / 0.55) * 0.22,
      0.9,
      { harmonic2: 0.3 },
    )
  })
  normalize(buf, 0.7)
  writeWav(path.join(OUT_DIR, 'chime.wav'), buf.L, buf.R)
}

function genPop() {
  const buf = makeBuffers(0.22)
  const nSamples = buf.L.length
  for (let i = 0; i < nSamples; i++) {
    const t = i / SR
    const freq = 780 - t * 2200
    const env = Math.exp(-t / 0.05) * 0.5
    const s = Math.sin(2 * Math.PI * Math.max(freq, 180) * t) * env
    buf.L[i] += s
    buf.R[i] += s
  }
  normalize(buf, 0.65)
  writeWav(path.join(OUT_DIR, 'pop.wav'), buf.L, buf.R)
}

genBackgroundMusic()
genWhoosh()
genChime()
genPop()
