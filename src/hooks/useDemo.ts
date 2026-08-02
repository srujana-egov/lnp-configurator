import { use } from 'react'
import { DemoContext } from '@/context/DemoContext'

export function useDemo() {
  const context = use(DemoContext)
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider')
  }
  return context
}
