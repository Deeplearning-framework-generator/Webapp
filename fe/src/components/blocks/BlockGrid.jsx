import React from 'react'
import BlockCard from './BlockCard'
import { BoxSelect } from 'lucide-react'

export default function BlockGrid({ blocks, onResetFilters }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center my-4">
        <BoxSelect className="size-10 text-slate-400 mb-3" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No blocks found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          No block matches your current category or search criteria. Try adjusting your filter settings.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 rounded-lg bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-4.5 my-2">
      {blocks.map((block) => (
        <BlockCard key={block.id} block={block} />
      ))}
    </div>
  )
}
