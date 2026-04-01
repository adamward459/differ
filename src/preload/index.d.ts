import { ElectronAPI } from '@electron-toolkit/preload'

interface DifferAPI {
  getOpenAtLogin(): Promise<boolean>
  setOpenAtLogin(enabled: boolean): Promise<void>
  openFolder(): Promise<string | null>
  getChangedFiles(folderPath: string): Promise<{
    files?: { name: string; status: string }[]
    error?: string
  }>
  getFileDiff(
    folderPath: string,
    filePath: string
  ): Promise<{
    leftLines?: { num: number; content: string; type: string }[]
    rightLines?: { num: number; content: string; type: string }[]
    raw?: string
    error?: string
  }>
  watchRepo(folderPath: string): Promise<void>
  unwatchRepo(): Promise<void>
  onRepoChanged(callback: () => void): () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: DifferAPI
  }
}
