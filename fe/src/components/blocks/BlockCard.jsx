import React from 'react'

const CATEGORY_STYLES = {
  DATA: {
    text: 'text-emerald-600 dark:text-emerald-400',
    bgDot: 'bg-emerald-500'
  },
  LAYER: {
    text: 'text-indigo-600 dark:text-indigo-400',
    bgDot: 'bg-indigo-500'
  },
  MERGE: {
    text: 'text-amber-600 dark:text-amber-400',
    bgDot: 'bg-amber-500'
  },
  LOSS: {
    text: 'text-rose-600 dark:text-rose-400',
    bgDot: 'bg-rose-500'
  },
  CALLBACK: {
    text: 'text-slate-600 dark:text-slate-400',
    bgDot: 'bg-slate-700 dark:bg-slate-300'
  }
}

export default function BlockCard({ block }) {
  const catStyle = CATEGORY_STYLES[block.category] || CATEGORY_STYLES.LAYER

  return (
    <div className="group relative flex flex-col justify-between h-full min-h-[160px] sm:min-h-[164px] rounded-xl border border-slate-200/85 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 sm:p-5 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs">
      <div>
        {/* Header: Category Badge & Version */}
        <div className="flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 font-bold tracking-wider text-[11px] uppercase ${catStyle.text}`}>
            <span className={`size-2 rounded-[2px] ${catStyle.bgDot}`} />
            <span>{block.category}</span>
          </div>
          <span className="text-[11.5px] text-slate-400 dark:text-slate-500 font-normal">
            {block.version}
          </span>
        </div>

        {/* Block Title */}
        <h3 className="mt-2.5 mb-2 font-bold text-slate-900 dark:text-white text-[15px] sm:text-[16px] leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
          {block.name}
        </h3>

        {/* Inputs & Outputs Lines */}
        <div className="flex flex-col gap-0.5 font-mono text-[11.5px] text-slate-500 dark:text-slate-400 leading-normal">
          {block.inputs && block.inputs.map((inp, i) => (
            <div key={`in-${i}`} className="truncate">
              {inp}
            </div>
          ))}
          {block.outputs && block.outputs.map((out, i) => (
            <div key={`out-${i}`} className="truncate">
              {out}
            </div>
          ))}
        </div>
      </div>

      {/* Card Footer Tag: Aligned to bottom baseline across all cards with comfortable breathing room */}
      <div className="mt-6 pt-1 text-[11.5px] font-normal text-slate-400 dark:text-slate-500 truncate">
        {block.footer}
      </div>
    </div>
  )
}
