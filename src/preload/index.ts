import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getOpenAtLogin: (): Promise<boolean> => ipcRenderer.invoke('get-open-at-login'),
  setOpenAtLogin: (enabled: boolean): Promise<void> =>
    ipcRenderer.invoke('set-open-at-login', enabled),
  openFolder: (): Promise<string | null> => ipcRenderer.invoke('open-folder'),
  getChangedFiles: (
    folderPath: string
  ): Promise<{
    files?: { name: string; status: string }[]
    error?: string
  }> => ipcRenderer.invoke('get-changed-files', folderPath),
  getFileDiff: (
    folderPath: string,
    filePath: string
  ): Promise<{
    leftLines?: { num: number; content: string; type: string }[]
    rightLines?: { num: number; content: string; type: string }[]
    raw?: string
    error?: string
  }> => ipcRenderer.invoke('get-file-diff', folderPath, filePath),
  watchRepo: (folderPath: string): Promise<void> => ipcRenderer.invoke('watch-repo', folderPath),
  unwatchRepo: (): Promise<void> => ipcRenderer.invoke('unwatch-repo'),
  openInIde: (command: string, folderPath: string, filePath: string, line: number): Promise<void> =>
    ipcRenderer.invoke('open-in-ide', command, folderPath, filePath, line),
  onRepoChanged: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on('repo-changed', handler)
    return () => ipcRenderer.removeListener('repo-changed', handler)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
