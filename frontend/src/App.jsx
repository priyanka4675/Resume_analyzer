import { useState } from 'react'
import { Zap, Github, ExternalLink, AlertCircle } from 'lucide-react'
import UploadZone from './components/UploadZone'
import ResultsDashboard from './components/ResultsDashboard'
import LoadingScreen from './components/LoadingScreen'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const App = () => {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!file) { setError('Please upload a resume PDF.'); return }
    if (!jobDescription.trim()) { setError('Please paste a job description.'); return }

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('job_description', jobDescription)

      const res = await fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Analysis failed. Please try again.')
        return
      }

      setResults(data)
    } catch (err) {
      setError('Network error. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setJobDescription('')
    setResults(null)
    setError('')
  }

  return (
    <div className="relative min-h-screen">
      {/* Ambient blobs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #14b268, transparent)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #14b268, transparent)' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <Zap size={18} fill="white" className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-lg leading-none">ResumeAI</span>
              <p className="text-xs text-white/30 font-mono">ATS Analyzer</p>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <Github size={14} />
            <span className="hidden sm:inline">View Source</span>
          </a>
        </header>

        {!results ? (
          <>
            {/* Hero */}
            {!loading && (
              <div className="text-center mb-12 animate-fade-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-brand-400 font-mono mb-6 border border-brand-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-green" />
                  Powered by Gemini AI
                </div>
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-tight glow-text mb-4">
                  Beat the ATS.<br />
                  <span className="text-brand-400">Land the Interview.</span>
                </h1>
                <p className="text-white/40 max-w-md mx-auto text-base leading-relaxed">
                  Upload your resume and paste a job description. Our AI analyzes your ATS compatibility, identifies gaps, and gives you actionable suggestions.
                </p>
              </div>
            )}

            {loading ? (
              <LoadingScreen />
            ) : (
              <div className="space-y-5 animate-fade-up" style={{ animationDelay: '200ms', opacity: 0 }}>
                {/* Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-white/30 uppercase tracking-widest px-1">
                    01 — Resume PDF
                  </label>
                  <UploadZone file={file} onFile={setFile} />
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-white/30 uppercase tracking-widest px-1">
                    02 — Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here — include required skills, responsibilities, and qualifications for best results..."
                    rows={6}
                    className="w-full glass rounded-2xl px-5 py-4 text-sm text-white/70 placeholder-white/20
                      focus:outline-none focus:border-brand-500/50 focus:bg-brand-500/5
                      resize-none transition-all font-body leading-relaxed"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  />
                  <p className="text-xs text-white/20 px-1">
                    {jobDescription.length} characters · Aim for 200+ for better results
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleAnalyze}
                  disabled={!file || !jobDescription.trim()}
                  className="w-full py-4 rounded-2xl font-display font-bold text-base transition-all duration-200
                    disabled:opacity-30 disabled:cursor-not-allowed
                    enabled:hover:scale-[1.01] enabled:active:scale-[0.99]"
                  style={{
                    background: 'linear-gradient(135deg, #0a9154, #14b268)',
                    boxShadow: file && jobDescription.trim() ? '0 8px 32px rgba(20,178,104,0.3)' : 'none',
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Zap size={16} fill="white" />
                    Analyze My Resume
                  </span>
                </button>

                {/* Features row */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { icon: '🎯', label: 'ATS Score' },
                    { icon: '🔍', label: 'Missing Keywords' },
                    { icon: '💡', label: 'AI Suggestions' },
                  ].map((f) => (
                    <div key={f.label} className="glass rounded-xl p-3 text-center">
                      <div className="text-xl mb-1">{f.icon}</div>
                      <p className="text-xs text-white/40">{f.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <ResultsDashboard data={results} onReset={handleReset} />
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20 font-mono">
            Built with React + Flask + Gemini AI
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-white/20 hover:text-white/50 transition-colors flex items-center gap-1">
              <ExternalLink size={10} />
              Deploy Guide
            </a>
            <span className="text-white/10">·</span>
            <p className="text-xs text-white/20">© 2025 ResumeAI</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
