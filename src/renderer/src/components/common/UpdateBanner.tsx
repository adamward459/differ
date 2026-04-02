import React from 'react'
import { RiDownloadLine, RiRestartLine, RiCloseLine } from '@remixicon/react'
import type { UpdateStatus } from '../../hooks/useAutoUpdate'

interface UpdateBannerProps {
  status: UpdateStatus
  onInstall: () => void
  onDismiss: () => void
}

const UpdateBanner = React.memo(function UpdateBanner({
  status,
  onInstall,
  onDismiss
}: UpdateBannerProps): React.JSX.Element | null {
  if (
    status.status === 'idle' ||
    status.status === 'checking' ||
    status.status === 'not-available'
  ) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent text-xs border-b border-accent/20 shrink-0">
      {status.status === 'available' && (
        <>
          <RiDownloadLine size={14} />
          <span>Downloading update v{status.version}…</span>
        </>
      )}
      {status.status === 'downloading' && (
        <>
          <RiDownloadLine size={14} />
          <span>Downloading update… {status.percent}%</span>
        </>
      )}
      {status.status === 'downloaded' && (
        <>
          <RiRestartLine size={14} />
          <span>Update v{status.version} ready.</span>
          <button
            onClick={onInstall}
            className="ml-1 underline hover:text-accent/80 cursor-pointer"
            type="button"
          >
            Restart now
          </button>
        </>
      )}
      {status.status === 'installing' && (
        <>
          <RiRestartLine size={14} />
          <span>Restarting to install v{status.version}…</span>
        </>
      )}
      {status.status === 'error' && <span>{status.message}</span>}
      <button
        onClick={onDismiss}
        className="ml-auto hover:text-accent/80 cursor-pointer"
        aria-label="Dismiss update banner"
        type="button"
      >
        <RiCloseLine size={14} />
      </button>
    </div>
  )
})

export default UpdateBanner
