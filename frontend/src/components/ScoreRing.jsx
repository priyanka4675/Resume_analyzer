import { useEffect, useState } from 'react'

const ScoreRing = ({ score, size = 180, strokeWidth = 12 }) => {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference

  const getColor = (s) => {
    if (s >= 80) return '#14b268'
    if (s >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getLabel = (s) => {
    if (s >= 80) return 'Excellent'
    if (s >= 60) return 'Good'
    if (s >= 40) return 'Fair'
    return 'Needs Work'
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score)
    }, 300)
    return () => clearTimeout(timer)
  }, [score])

  const color = getColor(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-xl"
          style={{ background: color }}
        />
        <svg width={size} height={size} className="relative z-10">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />
          {/* Score text */}
          <text
            x={size / 2}
            y={size / 2 - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="36"
            fontWeight="800"
            fontFamily="Syne, sans-serif"
            fill={color}
          >
            {score}
          </text>
          <text
            x={size / 2}
            y={size / 2 + 22}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontFamily="DM Sans, sans-serif"
            fill="rgba(255,255,255,0.4)"
            letterSpacing="2"
          >
            ATS SCORE
          </text>
        </svg>
      </div>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{
          color,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        {getLabel(score)}
      </span>
    </div>
  )
}

export default ScoreRing
