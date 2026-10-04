import { NavLink } from 'react-router-dom'
import { navItems } from './navItems.js'

function LogoMark({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="8" height="8" rx="2" />
      <rect x="14" y="14" width="8" height="8" rx="2" />
      <path d="M6 10v2a4 4 0 0 0 4 4h4" />
    </svg>
  )
}

export default function Sidebar({ collapsed }) {
  const visibleItems = navItems.filter((item) => !item.hidden)

  return (
    <aside
      className={`
        sticky top-0 flex h-screen shrink-0 flex-col gap-5
        border-r border-line bg-surface px-3 pt-3.5 pb-4
        ${collapsed ? 'w-16' : 'w-58'}
      `}
    >
      
      <NavLink
        to="/"
        aria-label="Pipeline Builder home"
        className={`flex h-9 items-center gap-2.5 ${collapsed ? 'justify-center' : 'px-1.5'}`}
      >
        <LogoMark className="size-6 shrink-0 text-accent" />
        {/* App name only when expanded */}
        {!collapsed && <span className="text-[15px] font-semibold">Pipeline Builder</span>}
      </NavLink>

      {/*  Navigation links  */}
      <nav aria-label="Main" className="flex flex-col gap-1">
        {visibleItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            aria-label={collapsed ? label : undefined}

            className={({ isActive }) => `
              flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors
              ${collapsed ? 'justify-center' : ''}
              ${
                isActive
                  ? 'bg-active font-semibold text-active-ink' // selected: tinted background
                  : 'font-medium text-nav hover:bg-hover'     // normal: grey, highlights on hover
              }
            `}
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
            {/* Label only when expanded */}
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Colab status*/}
      {/* Hardcoded for now. Have to figure this out. */}
      <div className="mt-auto">
        {collapsed ? (
          // Collapsed: just the green dot in a small box
          <div
            title="Colab connected"
            className="flex h-10 items-center justify-center rounded-lg border border-line"
          >
            <span className="size-2 rounded-full bg-ok" />
            <span className="sr-only">Colab connected</span> {/* read by screen readers only */}
          </div>
        ) : (
          // Expanded: dot + title + description
          <div className="rounded-lg border border-line p-3">
            <p className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="size-2 rounded-full bg-ok" />
              Colab connected
            </p>
            <p className="text-xs text-muted">Runs open in your Google Colab</p>
          </div>
        )}
      </div>
    </aside>
  )
}
