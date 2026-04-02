import { BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { UpdateInfo, ProgressInfo } from 'electron-updater'

export type UpdateStatus =
  | { status: 'checking' }
  | { status: 'available'; version: string }
  | { status: 'not-available' }
  | { status: 'downloading'; percent: number }
  | { status: 'downloaded'; version: string }
  | { status: 'error'; message: string }

function broadcast(channel: string, data: UpdateStatus): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(channel, data)
  }
}

export function initAutoUpdater(): void {
  // Download updates in background, but never auto-install or auto-restart
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.on('checking-for-update', () => {
    broadcast('update-status', { status: 'checking' })
  })

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    broadcast('update-status', { status: 'available', version: info.version })
  })

  autoUpdater.on('update-not-available', () => {
    broadcast('update-status', { status: 'not-available' })
  })

  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    broadcast('update-status', { status: 'downloading', percent: Math.round(progress.percent) })
  })

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    broadcast('update-status', { status: 'downloaded', version: info.version })
  })

  autoUpdater.on('error', (err: Error) => {
    broadcast('update-status', { status: 'error', message: err.message })
  })

  // Check on launch, then every 30 minutes
  autoUpdater.checkForUpdates().catch(() => {})
  setInterval(
    () => {
      autoUpdater.checkForUpdates().catch(() => {})
    },
    30 * 60 * 1000
  )
}

export function checkForUpdatesManually(): void {
  autoUpdater.checkForUpdates().catch(() => {})
}

export function quitAndInstall(): void {
  // Quit and install when user explicitly clicks "Restart now"
  // isSilent=false shows dialogs if needed
  // isForceRunAfter=true ensures app restarts after install
  autoUpdater.quitAndInstall(false, true)
}
