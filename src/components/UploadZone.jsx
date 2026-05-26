import { useRef, useState } from 'react'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'

const UploadZone = ({ file, onFile }) => {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type === 'application/pdf') {
      onFile(dropped)
    }
  }

  const handleChange = (e) => {
    const selected = e.target.files[0]
    if (selected) onFile(selected)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (file) {
    return (
      <div className="glass rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-white/40 font-mono">{formatSize(file.size)} · PDF</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-brand-400" />
          <button
            onClick={() => onFile(null)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-white/40 hover:text-red-400" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`drop-zone glass rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer border-2 border-dashed transition-all
        ${dragging ? 'border-brand-400 bg-brand-500/10' : 'border-white/10 hover:border-brand-500/50 hover:bg-brand-500/5'}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${dragging ? 'bg-brand-500/30' : 'bg-brand-500/10'}`}>
        <Upload size={24} className={`transition-colors ${dragging ? 'text-brand-300' : 'text-brand-500'}`} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white/80">
          {dragging ? 'Drop your resume here' : 'Drag & drop your resume'}
        </p>
        <p className="text-xs text-white/30 mt-1">or click to browse · PDF only · Max 10MB</p>
      </div>
    </div>
  )
}

export default UploadZone
