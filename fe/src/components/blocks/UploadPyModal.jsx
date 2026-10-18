import React, { useState, useEffect } from 'react'
import { X, FileCode, CheckCircle, GitBranch, ArrowRight, AlertCircle, Copy } from 'lucide-react'

const MODALITY_OPTIONS = ['All', 'Image', 'Audio', 'Text', 'Classification']
const CATEGORY_OPTIONS = [
  { key: 'LAYER', label: 'Layer' },
  { key: 'MERGE', label: 'Merge' },
  { key: 'LOSS', label: 'Loss' },
  { key: 'CALLBACK', label: 'Callback' }
]

export function formatDisplayName(rawName) {
  if (!rawName) return 'Custom Block'
  const clean = rawName.replace(/\.py$/i, '')
  if (clean.includes('_') || clean.includes('-')) {
    return clean
      .split(/[-_]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }
  return clean
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .trim()
}

export function getNextVersion(currentVersion = 'v1') {
  if (!currentVersion || currentVersion === 'Built-in' || currentVersion === 'Hugging Face') {
    return 'v1.1'
  }
  // If format is vX.Y (e.g. v1.1, v1.2, v2.0)
  const minorMatch = currentVersion.match(/^v?(\d+)\.(\d+)$/i)
  if (minorMatch) {
    const major = minorMatch[1]
    const minor = parseInt(minorMatch[2], 10) + 1
    return `v${major}.${minor}`
  }
  // If format is vX (e.g. v1, v2, v3)
  const majorMatch = currentVersion.match(/^v?(\d+)$/i)
  if (majorMatch) {
    const major = majorMatch[1]
    return `v${major}.1`
  }
  return 'v1.1'
}

export default function UploadPyModal({ isOpen, onClose, initialFile, existingBlocks = [], onConfirm }) {
  const [fileName, setFileName] = useState('')
  const [blockName, setBlockName] = useState('')
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(false)
  const [codeSnippet, setCodeSnippet] = useState('')
  const [selectedModality, setSelectedModality] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('LAYER')
  const [conflict, setConflict] = useState(null)

  // Auto-detect class name and category from code/filename (Modality defaults to All)
  const detectMetadata = (code, name) => {
    const text = (code + ' ' + name).toLowerCase()
    
    // Extract Python class name if present
    const classMatch = code.match(/class\s+([A-Za-z0-9_]+)/)
    const detectedClassName = classMatch ? classMatch[1] : name
    if (!isNameManuallyEdited) {
      setBlockName(formatDisplayName(detectedClassName))
    }

    // Detect category (only for module code blocks)
    if (text.includes('loss') || text.includes('criterion')) {
      setSelectedCategory('LOSS')
    } else if (text.includes('callback')) {
      setSelectedCategory('CALLBACK')
    } else if (text.includes('concat') || text.includes('merge') || text.includes('fusion') || text.includes('add')) {
      setSelectedCategory('MERGE')
    } else {
      setSelectedCategory('LAYER')
    }

    // Modality always defaults to 'All'
    setSelectedModality('All')
  }

  useEffect(() => {
    setConflict(null)
    if (initialFile) {
      const fName = initialFile.name || 'custom_layer.py'
      setFileName(fName)
      setIsNameManuallyEdited(false)
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
      setIsNameManuallyEdited(false)
      detectMetadata(defaultCode, defaultName)
    }
  }, [initialFile, isOpen])

  if (!isOpen) return null

  const handleCodeChange = (newCode) => {
    setCodeSnippet(newCode)
    if (!isNameManuallyEdited) {
      const classMatch = newCode.match(/class\s+([A-Za-z0-9_]+)/)
      if (classMatch) {
        setBlockName(formatDisplayName(classMatch[1]))
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedName = blockName.trim() || 'Custom Block'
    const normalizedName = trimmedName.toLowerCase()

    // Check if a block with the same name already exists in existingBlocks
    const found = existingBlocks?.find(
      (b) => b.name && b.name.toLowerCase() === normalizedName
    )

    if (found) {
      const nextVer = getNextVersion(found.version || 'v1')
      setConflict({
        existingBlock: found,
        nextVersion: nextVer
      })
      return
    }

    // No conflict, create normally
    onConfirm(codeSnippet, fileName, initialFile, {
      name: trimmedName,
      modality: selectedModality,
      category: selectedCategory,
      version: 'v1',
      replaceExisting: false
    })
    onClose()
  }

  const handleConfirmUpdateVersion = () => {
    if (!conflict) return
    onConfirm(codeSnippet, fileName, initialFile, {
      name: conflict.existingBlock.name,
      modality: selectedModality,
      category: selectedCategory,
      version: conflict.nextVersion,
      replaceExisting: true,
      existingBlockId: conflict.existingBlock.id
    })
    setConflict(null)
    onClose()
  }

  const handleConfirmCreateSeparate = () => {
    if (!conflict) return
    const trimmedName = blockName.trim() || 'Custom Block'
    onConfirm(codeSnippet, fileName, initialFile, {
      name: `${trimmedName} (Copy)`,
      modality: selectedModality,
      category: selectedCategory,
      version: 'v1',
      replaceExisting: false
    })
    setConflict(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className={`flex size-8 items-center justify-center rounded-lg ${
              conflict
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                : 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400'
            }`}>
              {conflict ? <GitBranch className="size-4" /> : <FileCode className="size-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {conflict ? 'Block Version Conflict' : 'Upload & Configure Block'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {conflict
                  ? 'A block with this name already exists in your library'
                  : 'Turn Python code into a categorized catalog block with human-readable name'}
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

        {/* Content View: Conflict Resolution OR Upload Form */}
        {conflict ? (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 text-xs text-amber-900 dark:text-amber-200">
              <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="leading-relaxed">
                A block named <span className="font-bold underline decoration-amber-400 underline-offset-2">"{conflict.existingBlock.name}"</span> is already registered in your library.
              </div>
            </div>

            {/* Version Transition Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-4">
              <div className="flex items-center justify-around py-1">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Current Version
                  </span>
                  <span className="inline-block font-mono font-bold text-xs px-3 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs">
                    {conflict.existingBlock.version || 'v1'}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-0.5 px-3">
                  <div className="flex size-7 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                    <ArrowRight className="size-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400">
                    Auto-increment
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-600 dark:text-teal-400 block mb-1">
                    New Version
                  </span>
                  <span className="inline-block font-mono font-bold text-xs px-3 py-1 rounded-md bg-teal-600 text-white shadow-xs">
                    {conflict.nextVersion}
                  </span>
                </div>
              </div>

              <div className="mt-3.5 border-t border-slate-200/60 dark:border-slate-700/60 pt-3 text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                Replacing will upgrade the block to <strong className="text-teal-700 dark:text-teal-300">{conflict.nextVersion}</strong>, updating its source code while keeping a single clean card in your catalog.
              </div>
            </div>

            {/* Decision Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmUpdateVersion}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d6e6e] hover:bg-[#0a5858] px-4 py-2.5 text-xs font-semibold text-white shadow-xs cursor-pointer transition-all"
              >
                <GitBranch className="size-4" />
                <span>Replace & Upgrade to {conflict.nextVersion}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmCreateSeparate}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors shadow-2xs"
              >
                <Copy className="size-3.5 text-slate-400" />
                <span>Don't replace, create as a separate block</span>
              </button>

              <button
                type="button"
                onClick={() => setConflict(null)}
                className="w-full py-1 text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-medium"
              >
                Cancel & back to editor
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
            {/* Block Name and File Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Block Name
                </label>
                <input
                  type="text"
                  value={blockName}
                  onChange={(e) => {
                    setBlockName(e.target.value)
                    setIsNameManuallyEdited(true)
                  }}
                  required
                  placeholder="e.g. Residual Attention Block"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  Parsed from class name with spaces, editable
                </p>
              </div>

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
                <p className="mt-1 text-[10px] text-slate-400">
                  Registry source file
                </p>
              </div>
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

            {/* Category Context Guidance Banner */}
            {selectedCategory === 'LAYER' ? (
              <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 p-2 text-[11px] text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                <span className="font-semibold">Layer Block:</span> Processes input tensors through <code className="font-mono">forward()</code>.
              </div>
            ) : selectedCategory === 'MERGE' ? (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-2 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <span className="font-semibold">Merge Block:</span> Combines multiple tensor inputs.
              </div>
            ) : selectedCategory === 'LOSS' ? (
              <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 p-2 text-[11px] text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <span className="font-semibold">Loss Block:</span> Evaluates predictions against targets.
              </div>
            ) : (
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-2 text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="font-semibold">Callback Block:</span> Hooks into lifecycle training events.
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Python Source Code
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  PyTorch Module
                </span>
              </div>
              <textarea
                rows={7}
                value={codeSnippet}
                onChange={(e) => handleCodeChange(e.target.value)}
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
        )}
      </div>
    </div>
  )
}
