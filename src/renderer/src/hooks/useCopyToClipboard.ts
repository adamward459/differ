import { useCallback, useEffect, useRef, useState } from 'react'

export function useCopyToClipboard(resetMs = 1500) {
  const [isCopied, setIsCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    return () => clearTimeout(timer.current)
  }, [])

  const copy = useCallback(
    (text: string) => {
      if (!text) return
      navigator.clipboard.writeText(text)
      setIsCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setIsCopied(false), resetMs)
    },
    [resetMs]
  )

  return { isCopied, copy } as const
}
