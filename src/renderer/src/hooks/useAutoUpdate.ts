import { useEffect, useState, useCallback } from 'react'

export type UpdateStatus =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available'; version: string }
  | { status: 'not-available' }
  | { status: 'downloading'; percent: number }
  | { status: 'downloaded'; version: string }
  | { status: 'installing'; version: string }
  | { status: 'error'; message: string }

interface UseAutoUpdateReturn {
  updateStatus: UpdateStatus
  checkForUpdates: () => void
  quitAndInstall: () => void
}

export function useAutoUpdate(): UseAutoUpdateReturn {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ status: 'idle' })

  useEffect(() => {
    const cleanup = window.api.onUpdateStatus((data) => {
      setUpdateStatus((prev) => {
        const next = data as UpdateStatus

        // Keep the ready/installing state visible until install succeeds or fails.
        if (
          (prev.status === 'downloaded' || prev.status === 'installing') &&
          (next.status === 'checking' || next.status === 'not-available')
        ) {
          return prev
        }

        return next
      })
    })
    return cleanup
  }, [])

  const checkForUpdates = useCallback(() => {
    window.api.checkForUpdates()
  }, [])

  const quitAndInstall = useCallback(() => {
    window.api.quitAndInstall()
  }, [])

  return { updateStatus, checkForUpdates, quitAndInstall }
}
