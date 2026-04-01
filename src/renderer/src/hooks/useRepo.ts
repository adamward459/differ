import { useState, useCallback, useRef, useEffect } from 'react'
import type { FileEntry, DiffLine } from '../types'
import { parseDiff } from '../utils/parseDiff'

function mapFiles(files: { name: string; status: string }[]): FileEntry[] {
  return files.map((f) => ({
    name: f.name,
    additions: 0,
    deletions: 0,
    status: f.status as FileEntry['status']
  }))
}

export function useRepo(
  onDiffUpdated: (file: string, left: DiffLine[], right: DiffLine[]) => void
) {
  const [folderPath, setFolderPath] = useState<string | null>(null)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [leftLines, setLeftLines] = useState<DiffLine[]>([])
  const [rightLines, setRightLines] = useState<DiffLine[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const folderRef = useRef(folderPath)
  const activeFileRef = useRef(activeFile)
  folderRef.current = folderPath
  activeFileRef.current = activeFile

  const applyDiff = useCallback(
    (result: Record<string, unknown>, fileName: string) => {
      if (result.error) return
      let left: DiffLine[]
      let right: DiffLine[]
      if (result.raw) {
        ;({ left, right } = parseDiff(result.raw as string))
      } else {
        left = (result.leftLines as DiffLine[]) ?? []
        right = (result.rightLines as DiffLine[]) ?? []
      }
      setLeftLines(left)
      setRightLines(right)
      onDiffUpdated(fileName, left, right)
    },
    [onDiffUpdated]
  )

  const applyDiffRef = useRef(applyDiff)
  applyDiffRef.current = applyDiff

  const handleOpenFolder = useCallback(async () => {
    const selected = await window.api.openFolder()
    if (!selected) return

    setFolderPath(selected)
    setLoading(true)
    setError(null)
    setActiveFile(null)
    setLeftLines([])
    setRightLines([])

    const result = await window.api.getChangedFiles(selected)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      setFiles([])
      return
    }

    setFiles(mapFiles(result.files ?? []))
    window.api.watchRepo(selected)
  }, [])

  const handleSelectFile = useCallback(
    async (fileName: string) => {
      if (!folderPath) return
      setActiveFile(fileName)
      const result = await window.api.getFileDiff(folderPath, fileName)
      applyDiff(result, fileName)
    },
    [folderPath, applyDiff]
  )

  // Subscribe to file system changes
  useEffect(() => {
    const unsubscribe = window.api.onRepoChanged(async () => {
      const fp = folderRef.current
      if (!fp) return

      const result = await window.api.getChangedFiles(fp)
      if (result.error) return

      const entries = mapFiles(result.files ?? [])
      setFiles(entries)

      const af = activeFileRef.current
      if (af) {
        if (entries.some((e) => e.name === af)) {
          const diffResult = await window.api.getFileDiff(fp, af)
          applyDiffRef.current(diffResult, af)
        } else {
          setActiveFile(null)
          setLeftLines([])
          setRightLines([])
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Clean up FS watcher on unmount only
  useEffect(() => {
    return () => {
      window.api.unwatchRepo()
    }
  }, [])

  return {
    folderPath,
    files,
    activeFile,
    leftLines,
    rightLines,
    loading,
    error,
    handleOpenFolder,
    handleSelectFile
  }
}
