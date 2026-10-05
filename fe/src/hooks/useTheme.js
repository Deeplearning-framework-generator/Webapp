import { useEffect, useState } from 'react'

//  Light/Dark mode toggle hook. Returns the current theme and a function to flip it.

export function useTheme() {
  // Start with whatever index.html already applied, so React and the page agree
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )

  // Runs every time `theme` changes
  useEffect(() => {
    // Add "dark" class if dark, remove it if light. index.css swaps colours based on it.
    document.documentElement.classList.toggle('dark', theme === 'dark')
    // Remember the choice
    localStorage.setItem('theme', theme)
  }, [theme])

  // Flip between light and dark
  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  return { theme, toggleTheme }
}
