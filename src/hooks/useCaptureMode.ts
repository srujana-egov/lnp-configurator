import { use } from 'react'
import { CaptureModeContext } from '@/context/CaptureModeContext'

export function useCaptureMode() {
  const context = use(CaptureModeContext)
  if (!context) {
    throw new Error('useCaptureMode must be used within a CaptureModeProvider')
  }
  return context
}
