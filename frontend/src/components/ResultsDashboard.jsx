import { useState } from 'react'
import {
  CheckCircle, XCircle, Lightbulb, TrendingUp, TrendingDown,
  Download, RefreshCw, ChevronDown, ChevronUp, Sparkles,
  Target, BookOpen, Briefcase, Copy, Check
} from 'lucide-react'
import ScoreRing from './ScoreRing'
import MiniBar from './MiniBar'

// Simple bar chart using SVG
const SkillChart = ({ matched, missing, darkMode }) => {
  const total = matched + missing || 1
  const matchedPct = Math.round((matched / total) * 100)
  const missingPct = 100 - matchedPct
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs mb-1">
        <span className={darkMode ? 'text-white/40' : 'text-gray-500'}>Skill Coverage</span>
        <span className="text-brand-400 font-mono">{matchedPct}% matched</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden flex" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
        <div className="h-full transition-all duration-1000 rounded-l-full"
          style={{ width: `${matchedPct}%`, background: 'linear-gradient(90deg, #0a9154, #14b268)', boxShadow: '0 0 8px rgba(20,178,104,0.4)' }} />
        <div className="h-full rounded-r-full"
          style={{ width: `${missingPct}%`, background: darkMode ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)' }} />
      </div>
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-brand-400"><span className="w-2 h-2 rounded-full bg-brand-400 inline-block" />{matched} matched</span>
        <span className="flex items-center gap-1.5 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{missing} missing</span>
      </div>
    </div>
  )
}

// Radar-like score overview using simple bars
const ScoreOverview = ({ data, darkMode }) => {
  const metrics = [
    { label: 'ATS Score', value: data.ats_score, color: '#14b268' },
    { label: 'Job Match', value: data.job_match_percent || 0, color: '#3b82f6' },
    { label: 'Keywords', value: data.keyword_density || 0, color: '#f59e0b' },
    { label: 'Formatting', value: data.formatting_score || 0, color: '#8b5cf6' },
    { label: 'Experience', value: data.experience_relevance || 0, color: '#ec4899' },
    { label: 'Education', value: data.education_score || 0, color: '#06b6d4' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map(m => (
        <div key={m.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className={darkMode ? 'text-white/40' : 'text-gray-500'}>{m.label}</span>
            <span className="font-mono font-semibold" style={{ color: m.color }}>{m.value}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${m.value}%`, background: m.color, boxShadow: `0 0 6px ${m.color}60` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const ResultsDashboard = ({ data, onReset, darkMode }) => {
  const [expandedSuggestion, setExpandedSuggestion] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)

  const card = darkMode
    ? 'glass rounded-2xl p-6 border border-white/5'
    : 'bg-white rounded-2xl p-6 border border-gray-100 shadow-sm'

  const tabClass = (t) => `px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
    activeTab === t
      ? 'bg-brand-500 text-white'
      : darkMode ? 'text-white/40 hover:text-white/70 hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
  }`

  const handleCopyRewrite = () => {
    navigator.clipboard.writeText(data.rewritten_summary || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const lines = [
      '╔══════════════════════════════════════╗',
      '║      RESUMEAI — ANALYSIS REPORT      ║',
      '╚══════════════════════════════════════╝',
      '',
      `ATS Score        : ${data.ats_score}/100`,
      `Job Match        : ${data.job_match_percent || 'N/A'}%`,
      `Role Match       : ${data.role_match}`,
      `Experience       : ~${data.experience_years || '?'} years`,
      '',
      '── SUMMARY ──────────────────────────────',
      data.summary,
      '',
      '── AI-REWRITTEN SUMMARY ─────────────────',
      data.rewritten_summary || 'N/A',
      '',
      '── STRENGTHS ────────────────────────────',
      ...(data.strengths || []).map(s => `  ✓ ${s}`),
      '',
      '── WEAKNESSES ───────────────────────────',
      ...(data.weaknesses || []).map(w => `  ✗ ${w}`),
      '',
      '── MISSING SKILLS ───────────────────────',
      ...(data.missing_skills || []).map(s => `  • ${s}`),
      '',
      '── MATCHED SKILLS ───────────────────────',
      ...(data.matched_skills || []).map(s => `  ✓ ${s}`),
      '',
      '── SKILL GAP ANALYSIS ───────────────────',
      ...(data.skill_gap_analysis || []).map(s => `  [${s.importance}] ${s.skill}\n    → ${s.how_to_learn}`),
      '',
      '── ROLE RECOMMENDATIONS ─────────────────',
      ...(data.multi_role_recommendations || []).map(r => `  ${r.match}% — ${r.role}\n    → ${r.reason}`),
      '',
      '── AI SUGGESTIONS ───────────────────────',
      ...(data.suggestions || []).map((s, i) => `  ${i + 1}. ${s.title}\n     ${s.description}`),
      '',
      '── SCORE BREAKDOWN ──────────────────────',
      `  Keyword Density    : ${data.keyword_density}%`,
      `  Formatting         : ${data.formatting_score}%`,
      `  Experience Rel.    : ${data.experience_relevance}%`,
      `  Education          : ${data.education_score || 'N/A'}%`,
      '',
      '─────────────────────────────────────────',
      'Generated by ResumeAI · Powered by Gemini',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'resumeai-report.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'skills', label: '🔍 Skills' },
    { id: 'suggestions', label: '💡 Suggestions' },
    { id: 'roles', label: '🎭 Roles' },
    { id: 'rewrite', label: '✍️ AI Rewrite' },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold">Analysis Complete</h2>
          <p className={`text-sm ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>Detailed ATS report for <strong>{data.role_match}</strong></p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl transition-all ${darkMode ? 'text-white/60 hover:text-white glass hover:bg-white/5' : 'text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200'}`}>
            <Download size={14} /> Download
          </button>
          <button onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-brand-400 hover:text-brand-300 rounded-xl transition-all hover:bg-brand-500/10">
            <RefreshCw size={14} /> New Analysis
          </button>
        </div>
      </div>

      {/* Score hero */}
      <div className={`${card} flex flex-col sm:flex-row items-center gap-8`}>
        <ScoreRing score={data.ats_score} />
        <div className="flex-1 w-full">
          <ScoreOverview data={data} darkMode={darkMode} />
        </div>
        <div className="text-center sm:text-right">
          <p className={`text-xs uppercase tracking-widest font-mono mb-1 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>Job Match</p>
          <p className="text-4xl font-display font-black text-brand-400">{data.job_match_percent || 0}%</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>~{data.experience_years || '?'} yrs experience</p>
        </div>
      </div>

      {/* Skill chart */}
      <div className={card}>
        <SkillChart matched={data.matched_skills?.length || 0} missing={data.missing_skills?.length || 0} darkMode={darkMode} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} className={tabClass(t.id)} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={card}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-brand-400" />
              <h3 className="text-sm font-semibold">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {(data.strengths || []).map((s, i) => (
                <li key={i} className={`flex items-start gap-2 text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                  <span className="text-brand-500 mt-0.5 flex-shrink-0">→</span>{s}
                </li>
              ))}
            </ul>
          </div>
          <div className={card}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown size={16} className="text-amber-400" />
              <h3 className="text-sm font-semibold">Weaknesses</h3>
            </div>
            <ul className="space-y-2">
              {(data.weaknesses || []).map((w, i) => (
                <li key={i} className={`flex items-start gap-2 text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>{w}
                </li>
              ))}
            </ul>
          </div>
          <div className={`${card} md:col-span-2`}>
            <h3 className={`text-xs font-mono uppercase tracking-widest mb-3 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>Resume Summary</h3>
            <p className={`text-sm leading-relaxed ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>{data.summary}</p>
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={card}>
            <div className="flex items-center gap-2 mb-4">
              <XCircle size={16} className="text-red-400" />
              <h3 className="text-sm font-semibold">Missing Skills</h3>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-mono">{data.missing_skills?.length || 0}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.missing_skills || []).map((skill, i) => (
                <span key={i} className="skill-tag text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ animationDelay: `${i * 60}ms`, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className={card}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={16} className="text-brand-400" />
              <h3 className="text-sm font-semibold">Matched Skills</h3>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-mono">{data.matched_skills?.length || 0}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.matched_skills || []).map((skill, i) => (
                <span key={i} className="skill-tag text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ animationDelay: `${i * 60}ms`, background: 'rgba(20,178,104,0.1)', border: '1px solid rgba(20,178,104,0.2)', color: '#6ee7b7' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Skill Gap Analysis */}
          <div className={`${card} md:col-span-2`}>
            <div className="flex items-center gap-2 mb-5">
              <BookOpen size={16} className="text-blue-400" />
              <h3 className="text-sm font-semibold">Skill Gap Analysis</h3>
              <span className={`text-xs ml-2 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>How to close the gaps</span>
            </div>
            <div className="space-y-3">
              {(data.skill_gap_analysis || []).map((item, i) => {
                const impColor = item.importance === 'High' ? 'text-red-400 bg-red-500/10 border-red-500/20'
                  : item.importance === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                return (
                  <div key={i} className={`rounded-xl p-4 ${darkMode ? 'bg-white/3 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold">{item.skill}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${impColor}`}>{item.importance}</span>
                    </div>
                    <p className={`text-xs flex items-start gap-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                      <span className="text-brand-500 flex-shrink-0 mt-0.5">→</span>{item.how_to_learn}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className={card}>
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold">AI Suggestions</h3>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono">{data.suggestions?.length || 0} actions</span>
          </div>
          <div className="space-y-3">
            {(data.suggestions || []).map((s, i) => (
              <div key={i}
                className={`rounded-xl overflow-hidden cursor-pointer transition-all ${darkMode ? 'bg-white/3 border border-white/5 hover:bg-white/6' : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'}`}
                onClick={() => setExpandedSuggestion(expandedSuggestion === i ? null : i)}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs font-mono text-amber-400 flex-shrink-0">{i + 1}</span>
                    <span className="text-sm font-medium">{s.title}</span>
                  </div>
                  {expandedSuggestion === i ? <ChevronUp size={14} className="opacity-30" /> : <ChevronDown size={14} className="opacity-30" />}
                </div>
                {expandedSuggestion === i && (
                  <div className="px-4 pb-4">
                    <p className={`text-sm pl-9 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{s.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className={card}>
          <div className="flex items-center gap-2 mb-5">
            <Briefcase size={16} className="text-purple-400" />
            <h3 className="text-sm font-semibold">Role Recommendations</h3>
            <span className={`text-xs ml-2 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>Based on your resume</span>
          </div>
          <div className="space-y-3">
            {(data.multi_role_recommendations || []).map((r, i) => (
              <div key={i} className={`rounded-xl p-4 flex items-start gap-4 ${darkMode ? 'bg-white/3 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-black text-lg"
                  style={{ background: r.match >= 80 ? 'rgba(20,178,104,0.15)' : r.match >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color: r.match >= 80 ? '#14b268' : r.match >= 60 ? '#f59e0b' : '#ef4444' }}>
                  {r.match}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.role}</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{r.reason}</p>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${r.match}%`, background: r.match >= 80 ? '#14b268' : r.match >= 60 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Rewrite Tab */}
      {activeTab === 'rewrite' && (
        <div className={card}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-brand-400" />
              <h3 className="text-sm font-semibold">AI-Rewritten Summary</h3>
            </div>
            <button onClick={handleCopyRewrite}
              className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl transition-all ${
                copied ? 'text-brand-400 bg-brand-500/10' : darkMode ? 'text-white/40 hover:text-white glass' : 'text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}>
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <div className={`p-4 rounded-xl text-sm leading-relaxed border-l-4 border-brand-500 ${darkMode ? 'bg-brand-500/5 text-white/70' : 'bg-brand-500/3 text-gray-700'}`}>
            {data.rewritten_summary || 'No rewritten summary available.'}
          </div>
          <div className={`mt-4 p-3 rounded-xl text-xs ${darkMode ? 'bg-amber-500/5 text-amber-400/70 border border-amber-500/10' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
            💡 This summary is optimized for ATS systems. Copy and use it as your resume's professional summary section.
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsDashboard
