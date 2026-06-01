import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const showError = useCallback((message) => {
    setToast(message)
  }, [])

  const dismiss = useCallback(() => {
    setToast(null)
  }, [])

  return { toast, showError, dismiss }
}
