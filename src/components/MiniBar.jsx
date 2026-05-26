import { useEffect, useState } from 'react'

const MiniBar = ({ label, value, delay = 0 }) => {
  const [width, setWidth] = useState(0)

  const getColor = (v) => {
    if (v >= 80) return '#14b268'
    if (v >= 60) return '#f59e0b'
    return '#ef4444'
  }

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 400 + delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  const color = getColor(value)

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/50 font-body">{label}</span>
        <span className="text-xs font-mono font-medium" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  )
}

export default MiniBar
