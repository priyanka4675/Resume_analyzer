import { useRef, useState } from 'react'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'

const UploadZone = ({ file, onFile, darkMode }) => {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type === 'application/pdf') onFile(dropped)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (file) {
    return (
      <div className={`rounded-2xl p-5 flex items-center justify-between gap-4 border ${darkMode ? 'glass border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
            <p className={`text-xs font-mono ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{formatSize(file.size)} · PDF</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-brand-400" />
          <button onClick={() => onFile(null)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'bg-white/5 hover:bg-red-500/20' : 'bg-gray-100 hover:bg-red-50'}`}>
            <X size={14} className="text-gray-400 hover:text-red-400" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer border-2 border-dashed transition-all ${
        dragging
          ? 'border-brand-400 bg-brand-500/10'
          : darkMode
            ? 'border-white/10 hover:border-brand-500/50 hover:bg-brand-500/5'
            : 'border-gray-200 hover:border-brand-400 hover:bg-brand-500/3 bg-white'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]) }} />
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${dragging ? 'bg-brand-500/30' : 'bg-brand-500/10'}`}>
        <Upload size={24} className={dragging ? 'text-brand-300' : 'text-brand-500'} />
      </div>
      <div className="text-center">
        <p className={`text-sm font-semibold ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
          {dragging ? 'Drop your resume here' : 'Drag & drop your resume'}
        </p>
        <p className={`text-xs mt-1 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>or click to browse · PDF only · Max 10MB</p>
      </div>
    </div>
  )
}

export default UploadZone
