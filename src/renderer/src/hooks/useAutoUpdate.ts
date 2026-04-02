import { useEffect, useState, useCallback } from 'react'

export type UpdateStatus =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available'; version: string }
  | { status: 'not-available' }
  | { status: 'downloading'; percent: number }
  | { status: 'downloaded'; version: string }
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
        // Once the update is downloaded, don't let periodic re-checks
        // (checking / not-available) overwrite the "downloaded" state.
        if (prev.status === 'downloaded' && (data as UpdateStatus).status !== 'error') {
          return prev
        }
        return data as UpdateStatus
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
