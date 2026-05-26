import { useEffect, useState } from 'react'

const steps = [
  { label: 'Reading your resume...', icon: '📄' },
  { label: 'Extracting skills & keywords...', icon: '🔍' },
  { label: 'Comparing with job description...', icon: '⚖️' },
  { label: 'Running ATS analysis...', icon: '🤖' },
  { label: 'Generating suggestions...', icon: '✨' },
]

const LoadingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }, 1800)
    const dotTimer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 400)
    return () => {
      clearInterval(stepTimer)
      clearInterval(dotTimer)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      {/* Animated orb */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-brand-500/30 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-brand-500 flex items-center justify-center text-2xl">
          {steps[currentStep].icon}
        </div>
      </div>

      {/* Current step */}
      <div className="text-center">
        <p className="text-lg font-display font-semibold text-white">
          {steps[currentStep].label.replace('...', '')}{dots}
        </p>
        <p className="text-sm text-white/30 mt-1">This usually takes 5–10 seconds</p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === currentStep ? '24px' : '8px',
              background: i <= currentStep ? '#14b268' : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default LoadingScreen
