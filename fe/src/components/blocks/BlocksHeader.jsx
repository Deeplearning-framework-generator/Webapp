import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Upload, Plus } from 'lucide-react'

export default function BlocksHeader({ onOpenUploadModal, onAddDataset }) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onOpenUploadModal(file)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Blocks
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your library. Datasets are blocks too, and every block can be used in any project.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Upload .py file button */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".py"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs cursor-pointer"
        >
          <Upload className="size-3.5 text-slate-600 dark:text-slate-300" />
          <span>Upload .py file</span>
        </button>

        {/* + New block */}
        <Link
          to="/blocks/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e6f6f] hover:bg-[#0b5c5c] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          <span>New block</span>
        </Link>
      </div>
    </div>
  )
}
