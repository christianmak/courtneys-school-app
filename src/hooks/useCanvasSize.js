import { useState, useEffect, useRef } from 'react'

export function useCanvasSize(maxWidth = 700, aspectRatio = 7 / 5) {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ width: maxWidth, height: Math.round(maxWidth / aspectRatio) })

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return
      const available = containerRef.current.clientWidth
      const width = Math.min(maxWidth, Math.max(300, available))
      setSize({ width, height: Math.round(width / aspectRatio) })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [maxWidth, aspectRatio])

  return { containerRef, ...size }
}
