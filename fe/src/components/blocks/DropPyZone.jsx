import React, { useState, useRef } from 'react'
import { Upload } from 'lucide-react'

export default function DropPyZone({ onDropFile }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const dragCounter = useRef(0)

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDragging(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setIsDragging(false)

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      const file = files[0]
      onDropFile(file)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onDropFile(file)
    }
    // Reset file input so re-selecting the same file fires onChange
    if (e.target) {
      e.target.value = ''
    }
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`group relative flex items-center justify-center rounded-xl border border-dashed py-4.5 px-6 text-center transition-all cursor-pointer my-3 ${
        isDragging
          ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 ring-2 ring-teal-400/40 scale-[1.005]'
          : 'border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-white/70'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept=".py"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* pointer-events-none prevents child elements from intercepting or cancelling drag/drop events */}
      <div className="pointer-events-none flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 select-none">
        <Upload className={`size-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 ${isDragging ? 'text-teal-600 animate-bounce' : ''}`} />
        <span>Drop a .py file here to turn its class into a block</span>
      </div>
    </div>
  )
}
