import { Box, Folder, LayoutGrid } from 'lucide-react'

export const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutGrid, end: true },
  { label: 'Projects', to: '/projects', icon: Folder },
  { label: 'Blocks', to: '/blocks', icon: Box },
  { label: 'Create Block', to: '/blocks/new', icon: Box, hidden: true },
]

export function getBreadcrumbs(pathname) {
  return navItems.filter(({ to, end }) =>
    end ? pathname === to : pathname.startsWith(to)
  )
}
