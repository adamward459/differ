import { useCallback, useEffect, useState } from 'react'

export function useStartup(): {
  openAtLogin: boolean
  toggleOpenAtLogin: () => void
} {
  const [openAtLogin, setOpenAtLogin] = useState(false)

  useEffect(() => {
    window.api.getOpenAtLogin().then(setOpenAtLogin)
  }, [])

  const toggleOpenAtLogin = useCallback(() => {
    const next = !openAtLogin
    setOpenAtLogin(next)
    window.api.setOpenAtLogin(next)
  }, [openAtLogin])

  return { openAtLogin, toggleOpenAtLogin }
}
