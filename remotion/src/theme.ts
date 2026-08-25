import { loadFont as loadDisplay } from '@remotion/google-fonts/PlayfairDisplay'
import { loadFont as loadBody } from '@remotion/google-fonts/SourceSerif4'
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono'

const display = loadDisplay('normal', { weights: ['600', '700'] })
const body = loadBody('normal', { weights: ['400', '600'] })
const mono = loadMono('normal', { weights: ['500'] })

export const fontDisplay = display.fontFamily
export const fontBody = body.fontFamily
export const fontMono = mono.fontFamily

export const colors = {
  brand: '#d4751f',
  brandLight: '#faecd8',
  ink: '#1a1713',
  inkMuted: '#7a7367',
  inkSubtle: '#b8b3a8',
  paper: '#fdf8f0',
  paperDark: '#f5ede0',
  white: '#ffffff',
}
