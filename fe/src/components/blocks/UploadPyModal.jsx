import React, { useState, useEffect } from 'react'
import { X, FileCode, CheckCircle, Sliders } from 'lucide-react'

const MODALITY_OPTIONS = ['All', 'Image', 'Audio', 'Text', 'Classification']
const CATEGORY_OPTIONS = [
  { key: 'LAYER', label: 'Layer' },
  { key: 'DATA', label: 'Data' },
  { key: 'MERGE', label: 'Merge' },
  { key: 'LOSS', label: 'Loss' },
  { key: 'CALLBACK', label: 'Callback' }
]

export default function UploadPyModal({ isOpen, onClose, initialFile, onConfirm }) {
  const [fileName, setFileName] = useState('')
  const [codeSnippet, setCodeSnippet] = useState('')
  const [selectedModality, setSelectedModality] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('LAYER')

  // Auto-detect modality and category from code/filename when file is loaded
  const detectMetadata = (code, name) => {
    const text = (code + ' ' + name).toLowerCase()
    
    // Detect category
    if (text.includes('dataset') || text.includes('data_loader') || text.includes('dataloader')) {
      setSelectedCategory('DATA')
    } else if (text.includes('loss') || text.includes('criterion')) {
      setSelectedCategory('LOSS')
    } else if (text.includes('callback')) {
      setSelectedCategory('CALLBACK')
    } else if (text.includes('concat') || text.includes('merge') || text.includes('fusion')) {
      setSelectedCategory('MERGE')
    } else {
      setSelectedCategory('LAYER')
    }

    // Detect modality
    if (text.includes('audio') || text.includes('waveform') || text.includes('spectrogram')) {
      setSelectedModality('Audio')
    } else if (text.includes('conv') || text.includes('image') || text.includes('b,c,h,w') || text.includes('patch')) {
      setSelectedModality('Image')
    } else if (text.includes('text') || text.includes('token') || text.includes('vocab') || text.includes('seq_len')) {
      setSelectedModality('Text')
    } else if (text.includes('classif')) {
      setSelectedModality('Classification')
    } else {
      setSelectedModality('All')
    }
  }

  useEffect(() => {
    if (initialFile) {
      const fName = initialFile.name || 'custom_layer.py'
      setFileName(fName)
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result || ''
        setCodeSnippet(content)
        detectMetadata(content, fName)
      }
      reader.readAsText(initialFile)
    } else {
      const defaultName = 'my_custom_block.py'
      const defaultCode = `import torch\nimport torch.nn as nn\n\nclass MyCustomBlock(nn.Module):\n    def __init__(self, in_features: int = 64, out_features: int = 64):\n        super().__init__()\n        self.fc = nn.Linear(in_features, out_features)\n        \n    def forward(self, x: torch.Tensor) -> torch.Tensor:\n        return self.fc(x)\n`
      setFileName(defaultName)
      setCodeSnippet(defaultCode)
      detectMetadata(defaultCode, defaultName)
    }
  }, [initialFile, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(codeSnippet, fileName, initialFile, {
      modality: selectedModality,
      category: selectedCategory
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <FileCode className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upload & Configure Block
              </h3>
              <p className="text-[11px] text-slate-500">
                Turn Python PyTorch/JAX code into a categorized catalog block
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>

          {/* Category & Modality Selection Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Modality
              </label>
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {MODALITY_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Python Source Code
              </label>
              <span className="text-[10px] text-slate-400 font-mono">PyTorch Module</span>
            </div>
            <textarea
              rows={8}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-950 p-3 text-xs font-mono text-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d6e6e] hover:bg-[#0a5858] px-4 py-1.5 text-xs font-semibold text-white shadow-xs cursor-pointer"
            >
              <CheckCircle className="size-3.5" />
              <span>Create Block</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
