import { Box, Folder, LayoutGrid } from 'lucide-react'

export const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutGrid, end: true },
  { label: 'Projects', to: '/projects', icon: Folder },
  { label: 'Blocks', to: '/blocks', icon: Box },
]

export function getSectionName(pathname) {
  const item = navItems.find(({ to, end }) =>
    end ? pathname === to : pathname.startsWith(to)
  )
  return item?.label ?? ''
}
