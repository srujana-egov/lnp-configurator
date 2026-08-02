import { use } from 'react'
import { CompilationContext } from '@/context/CompilationContext'

export function useCompilation() {
  const context = use(CompilationContext)
  if (!context) {
    throw new Error('useCompilation must be used within a CompilationProvider')
  }
  return context
}
