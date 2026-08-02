import { createContext, useState, type ReactNode } from 'react'

export interface CaptureModeContextValue {
  isActive: boolean
  toggle: () => void
}

export const CaptureModeContext = createContext<CaptureModeContextValue | undefined>(undefined)

export function CaptureModeProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)

  return (
    <CaptureModeContext.Provider value={{ isActive, toggle: () => setIsActive((current) => !current) }}>
      {children}
    </CaptureModeContext.Provider>
  )
}
