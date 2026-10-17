import React, { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check } from 'lucide-react'
import { CATEGORIES, MODALITIES } from '../../hooks/useBlocks'

export default function BlocksFilterBar({
  selectedCategory,
  onCategoryChange,
  categoryCounts,
  selectedModality,
  onModalityChange,
  searchQuery,
  onSearchChange
}) {
  const [isModalityOpen, setIsModalityOpen] = useState(false)
  const modalityRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalityRef.current && !modalityRef.current.contains(event.target)) {
        setIsModalityOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsModalityOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between my-2">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key
          const count = categoryCounts[cat.key] || 0

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onCategoryChange(cat.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-2xs border border-transparent'
                  : 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 font-medium'
              }`}
            >
              {cat.colorDot && (
                <span className={`size-2 rounded-[2px] ${cat.colorDot}`} />
              )}
              <span>{cat.label}</span>
              <span className={`text-[11px] ${isSelected ? 'text-slate-300 dark:text-slate-600 font-bold' : 'text-slate-400 dark:text-slate-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Right controls: Modality dropdown + Search input */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Custom Modality Dropdown */}
        <div className="relative" ref={modalityRef}>
          <button
            type="button"
            id="modality-dropdown-btn"
            onClick={() => setIsModalityOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isModalityOpen}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer select-none shadow-2xs ${
              isModalityOpen
                ? 'border-teal-600 ring-2 ring-teal-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <span className="text-slate-500 dark:text-slate-400 font-normal">Modality</span>
            <span className="font-semibold text-slate-900 dark:text-white">{selectedModality}</span>
            <ChevronDown
              className={`size-3.5 text-slate-400 transition-transform duration-150 ${
                isModalityOpen ? 'rotate-180 text-teal-600' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isModalityOpen && (
            <div
              role="listbox"
              className="absolute left-0 top-full mt-1.5 z-40 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Filter by Modality
              </div>
              {MODALITIES.map((mod) => {
                const isSelected = selectedModality === mod
                return (
                  <button
                    key={mod}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onModalityChange(mod)
                      setIsModalityOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                    }`}
                  >
                    <span>{mod}</span>
                    {isSelected && <Check className="size-3.5 text-teal-600 dark:text-teal-400" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="relative flex-1 sm:w-64 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search blocks"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8.5 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs"
          />
        </div>
      </div>
    </div>
  )
}
