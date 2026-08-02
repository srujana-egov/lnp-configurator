import { useEffect, useState } from 'react'

const CHAR_SPEED_MS = 35

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useTypewriter(text: string, skip: boolean) {
  const [length, setLength] = useState(skip || prefersReducedMotion() ? text.length : 0)

  useEffect(() => {
    if (skip || prefersReducedMotion()) {
      setLength(text.length)
      return
    }

    setLength(0)
    let current = 0
    const interval = setInterval(() => {
      current += 1
      setLength(current)
      if (current >= text.length) clearInterval(interval)
    }, CHAR_SPEED_MS)

    return () => clearInterval(interval)
  }, [text, skip])

  return {
    displayedText: text.slice(0, length),
    isDone: length >= text.length,
  }
}
