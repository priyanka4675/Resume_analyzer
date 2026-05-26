import { useState } from 'react'
import { Zap, Github, Sun, Moon, ExternalLink, AlertCircle } from 'lucide-react'
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
  const [darkMode, setDarkMode] = useState(true)
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('resumeHistory') || '[]') } catch { return [] }
  })
  const [showHistory, setShowHistory] = useState(false)

  const handleAnalyze = async () => {
    if (!file) { setError('Please upload a resume PDF.'); return }
    if (!jobDescription.trim()) { setError('Please paste a job description.'); return }
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('job_description', jobDescription)
      const res = await fetch(`${BACKEND_URL}/analyze`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Analysis failed. Please try again.'); return }
      // Save to history
      const entry = {
        id: Date.now(),
        filename: file.name,
        date: new Date().toLocaleDateString(),
        score: data.ats_score,
        role: data.role_match,
        data,
      }
      const newHistory = [entry, ...history].slice(0, 5)
      setHistory(newHistory)
      try { localStorage.setItem('resumeHistory', JSON.stringify(newHistory)) } catch {}
      setResults(data)
    } catch (err) {
      setError('Network error. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null); setJobDescription(''); setResults(null); setError('')
  }

  const bg = darkMode
    ? 'bg-surface-900 text-white'
    : 'bg-gray-50 text-gray-900'

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${bg}`}>
      {darkMode && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #14b268, transparent)' }} />
          <div className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #14b268, transparent)' }} />
        </>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <Zap size={18} fill="white" className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg leading-none">ResumeAI</span>
              <p className={`text-xs font-mono ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>ATS Analyzer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {history.length > 0 && !results && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${darkMode ? 'border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}
              >
                History ({history.length})
              </button>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'bg-white/5 hover:bg-white/10 text-white/50' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <a href="https://github.com/priyanka4675/Resume_analyzer" target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-2 text-xs transition-colors ${darkMode ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-700'}`}>
              <Github size={14} />
              <span className="hidden sm:inline">View Source</span>
            </a>
          </div>
        </header>

        {/* History Panel */}
        {showHistory && !results && (
          <div className={`mb-8 rounded-2xl p-5 border ${darkMode ? 'glass border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
            <h3 className="text-sm font-semibold mb-4">Recent Analyses</h3>
            <div className="space-y-2">
              {history.map(h => (
                <div key={h.id}
                  onClick={() => { setResults(h.data); setShowHistory(false) }}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${darkMode ? 'bg-white/3 hover:bg-white/8 border border-white/5' : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'}`}>
                  <div>
                    <p className="text-sm font-medium">{h.filename}</p>
                    <p className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>{h.role} · {h.date}</p>
                  </div>
                  <span className={`text-lg font-bold font-mono ${h.score >= 80 ? 'text-brand-400' : h.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {h.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!results ? (
          <>
            {!loading && (
              <div className="text-center mb-12 animate-fade-up">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-brand-400 font-mono mb-6 border border-brand-500/20 ${darkMode ? 'glass' : 'bg-brand-500/5'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-green" />
                  Powered by Gemini AI
                </div>
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight glow-text mb-4">
                  Beat the ATS.<br />
                  <span className="text-brand-400">Land the Interview.</span>
                </h1>
                <p className={`max-w-md mx-auto text-base leading-relaxed ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                  Upload your resume and paste a job description. Get ATS score, skill gap analysis, role recommendations, and AI-rewritten summary.
                </p>
              </div>
            )}

            {loading ? <LoadingScreen darkMode={darkMode} /> : (
              <div className="space-y-5 animate-fade-up" style={{ animationDelay: '200ms', opacity: 0 }}>
                <div className="space-y-2">
                  <label className={`text-xs font-mono uppercase tracking-widest px-1 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>01 — Resume PDF</label>
                  <UploadZone file={file} onFile={setFile} darkMode={darkMode} />
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-mono uppercase tracking-widest px-1 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>02 — Job Description</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here — include required skills, responsibilities, and qualifications..."
                    rows={6}
                    className={`w-full rounded-2xl px-5 py-4 text-sm placeholder-opacity-30 focus:outline-none resize-none transition-all leading-relaxed border ${
                      darkMode
                        ? 'glass text-white/70 placeholder-white/20 focus:border-brand-500/50 border-white/10'
                        : 'bg-white text-gray-700 placeholder-gray-300 focus:border-brand-400 border-gray-200 shadow-sm'
                    }`}
                  />
                  <p className={`text-xs px-1 ${darkMode ? 'text-white/20' : 'text-gray-400'}`}>
                    {jobDescription.length} characters · Aim for 200+ for better results
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={!file || !jobDescription.trim()}
                  className="w-full py-4 rounded-2xl font-display font-bold text-base text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:scale-[1.01] enabled:active:scale-[0.99]"
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

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                  {[
                    { icon: '🎯', label: 'ATS Score' },
                    { icon: '🔍', label: 'Skill Gap' },
                    { icon: '💡', label: 'AI Suggestions' },
                    { icon: '📊', label: 'Charts' },
                    { icon: '🎭', label: 'Role Match' },
                    { icon: '✍️', label: 'AI Rewrite' },
                  ].map((f) => (
                    <div key={f.label} className={`rounded-xl p-3 text-center ${darkMode ? 'glass' : 'bg-white border border-gray-100 shadow-sm'}`}>
                      <div className="text-xl mb-1">{f.icon}</div>
                      <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{f.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <ResultsDashboard data={results} onReset={handleReset} darkMode={darkMode} />
        )}

        <footer className={`mt-16 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
          <p className={`text-xs font-mono ${darkMode ? 'text-white/20' : 'text-gray-400'}`}>Built with React + Flask + Gemini AI</p>
          <p className={`text-xs ${darkMode ? 'text-white/20' : 'text-gray-400'}`}>© 2025 ResumeAI</p>
        </footer>
      </div>
    </div>
  )
}

export default App
