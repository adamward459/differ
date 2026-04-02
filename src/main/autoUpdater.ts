import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { UpdateInfo, ProgressInfo } from 'electron-updater'

export type UpdateStatus =
  | { status: 'checking' }
  | { status: 'available'; version: string }
  | { status: 'not-available' }
  | { status: 'downloading'; percent: number }
  | { status: 'downloaded'; version: string }
  | { status: 'installing'; version: string }
  | { status: 'error'; message: string }

function broadcast(channel: string, data: UpdateStatus): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(channel, data)
  }
}

function getCurrentVersion(): string {
  return app.getVersion()
}

function isVersionNewer(candidateVersion: string, currentVersion: string): boolean {
  const normalize = (version: string): number[] =>
    version
      .replace(/^v/i, '')
      .split('-')[0]
      .split('.')
      .map((part) => Number.parseInt(part, 10) || 0)

  const candidate = normalize(candidateVersion)
  const current = normalize(currentVersion)
  const length = Math.max(candidate.length, current.length)

  for (let i = 0; i < length; i += 1) {
    const left = candidate[i] ?? 0
    const right = current[i] ?? 0

    if (left > right) return true
    if (left < right) return false
  }

  return false
}

function isPackagedBuild(): boolean {
  return app.isPackaged
}

function broadcastUpdaterUnavailable(): void {
  broadcast('update-status', {
    status: 'error',
    message: 'Updates are only available in packaged builds.'
  })
}

export function initAutoUpdater(): void {
  if (!isPackagedBuild()) {
    return
  }

  // Download updates in background and keep the default install-on-quit flow.
  // Update checks are now manual from the application menu.
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    broadcast('update-status', { status: 'checking' })
  })

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    if (!isVersionNewer(info.version, getCurrentVersion())) {
      broadcast('update-status', { status: 'not-available' })
      return
    }

    broadcast('update-status', { status: 'available', version: info.version })
  })

  autoUpdater.on('update-not-available', () => {
    broadcast('update-status', { status: 'not-available' })
  })

  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    broadcast('update-status', { status: 'downloading', percent: Math.round(progress.percent) })
  })

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    if (!isVersionNewer(info.version, getCurrentVersion())) {
      broadcast('update-status', { status: 'not-available' })
      return
    }

    broadcast('update-status', { status: 'downloaded', version: info.version })
  })

  autoUpdater.on('error', (err: Error) => {
    broadcast('update-status', { status: 'error', message: err.message })
  })

}

export function checkForUpdatesManually(): void {
  if (!isPackagedBuild()) {
    broadcastUpdaterUnavailable()
    return
  }

  autoUpdater.checkForUpdates().catch(() => {})
}

export function quitAndInstall(): void {
  if (!isPackagedBuild()) {
    broadcastUpdaterUnavailable()
    return
  }

  const version = autoUpdater.updateInfoAndProvider?.info.version

  if (version && !isVersionNewer(version, getCurrentVersion())) {
    broadcast('update-status', { status: 'not-available' })
    return
  }

  if (version) {
    broadcast('update-status', { status: 'installing', version })
  }

  // Defer quit so the IPC response completes before the app exits.
  // isSilent=true avoids blocking confirmation dialogs on macOS.
  // isForceRunAfter=true ensures the app relaunches after installing.
  setImmediate(() => autoUpdater.quitAndInstall(true, true))
}
