import { useLocation } from 'react-router-dom'
import { Bell, ChevronDown, CircleHelp, Moon, PanelLeft, Sun } from 'lucide-react'
import { getSectionName } from './navItems.js'

const iconButton =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-ink'

export default function Header({ collapsed, onToggleSidebar, theme, onToggleTheme }) {

  const { pathname } = useLocation()
  const isDark = theme === 'dark'

  return (
    <header
      className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface pr-4 pl-3 md:pr-6 md:pl-4"
     
    >

      {/* Sidebar minimise/expand button */}
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={collapsed ? 'Expand sidebar' : 'Minimise sidebar'}
        aria-expanded={!collapsed}
        className={iconButton}
      >
        <PanelLeft className="size-5" strokeWidth={1.8} />
      </button>
        {/* Section name */}
      <span className="min-w-0 truncate text-[15px] font-semibold">
        {getSectionName(pathname)}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={iconButton}
        >
          {isDark ? (
            <Sun className="size-5" strokeWidth={1.8} />
          ) : (
            <Moon className="size-5" strokeWidth={1.8} />
          )}
        </button>

        <button type="button" aria-label="Help" className={iconButton}>
          <CircleHelp className="size-5" strokeWidth={1.8} />
        </button>

        {/* Notifications (no action yet). The dot means "unread". */}
        <button type="button" aria-label="Notifications" className={`${iconButton} relative`}>
          <Bell className="size-5" strokeWidth={1.8} />
          <span className="absolute top-2.5 right-3 size-2 rounded-full border-2 border-surface bg-accent" />
        </button>

        <span aria-hidden="true" className="mx-2 hidden h-6 w-px bg-line sm:block" />

       <button
          type="button"
          aria-label="Account menu"
          className="inline-flex h-11 items-center gap-2 rounded-lg pr-1.5 pl-1 text-muted transition-colors hover:bg-hover"
        >
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-active text-xs font-bold text-active-ink">
            XX
          </span>
          <ChevronDown className="hidden size-4 sm:block" />
        </button>
      </div>
    </header>
  )
}
