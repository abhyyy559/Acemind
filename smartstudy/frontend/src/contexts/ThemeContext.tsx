// Theme Context for Dark/Light Mode

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const lightColors = {
  primary: '#4f46e5', // indigo-600
  secondary: '#6b7280', // gray-500
  success: '#059669', // emerald-600
  warning: '#d97706', // amber-600
  error: '#dc2626', // red-600
  info: '#0284c7', // sky-600
  background: '#ffffff',
  surface: '#f9fafb', // gray-50
  text: '#111827', // gray-900
  textSecondary: '#6b7280', // gray-500
  border: '#e5e7eb', // gray-200
}

const darkColors = {
  primary: '#6366f1', // indigo-500
  secondary: '#9ca3af', // gray-400
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444', // red-500
  info: '#0ea5e9', // sky-500
  background: '#111827', // gray-900
  surface: '#1f2937', // gray-800
  text: '#f9fafb', // gray-50
  textSecondary: '#d1d5db', // gray-300
  border: '#374151', // gray-700
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const colors = theme === 'light' ? lightColors : darkColors

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}