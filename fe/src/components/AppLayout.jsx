import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import { useTheme } from '../hooks/useTheme.js'


export default function AppLayout() {
  const { theme, toggleTheme } = useTheme()

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  )

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')

    const onChange = (e) => {
      if (e.matches) setCollapsed(true)
    }

    onChange(mq)                             
    mq.addEventListener('change', onChange) 
    return () => mq.removeEventListener('change', onChange) 
  }, [])

  return (
    <div className="flex min-h-screen bg-page font-sans text-ink">
      <Sidebar collapsed={collapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 px-4 py-6 md:px-10 md:py-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}
