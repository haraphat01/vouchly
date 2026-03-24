interface Props {
  score: number
  color: string
  size?: number
}

export default function ProofScoreRing({ score, color, size = 100 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.36
  const strokeWidth = size * 0.072
  const circumference = 2 * Math.PI * r
  const dash = (score / 100) * circumference

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* Track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#eceae6"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {/* Score number */}
      <text
        x={cx} y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.22}
        fontWeight="700"
        fill={color}
        fontFamily="Georgia, serif"
      >
        {score}
      </text>
    </svg>
  )
}
