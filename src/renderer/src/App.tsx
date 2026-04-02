import { useCallback, useState } from 'react'
import Sidebar from './components/sidebar/Sidebar'
import DiffPanel from './components/diff/DiffPanel'
import LandingView from './components/common/LandingView'
import StatusMessage from './components/common/StatusMessage'
import { useRepo } from './hooks/useRepo'
import { useThreads } from './hooks/useThreads'
import type { DiffLine } from './types'

function App(): React.JSX.Element {
  const [activeDiff, setActiveDiff] = useState<{
    file: string | null
    left: DiffLine[]
    right: DiffLine[]
  }>({ file: null, left: [], right: [] })

  const threadState = useThreads(activeDiff.file, activeDiff.left, activeDiff.right)

  const handleDiffUpdated = useCallback(
    (file: string, left: DiffLine[], right: DiffLine[]) => {
      setActiveDiff({ file, left, right })
      threadState.refreshOutdated(file, left, right)
    },
    [threadState.refreshOutdated]
  )

  const repo = useRepo(handleDiffUpdated)

  if (!repo.folderPath) {
    return <LandingView onOpenFolder={repo.handleOpenFolder} />
  }

  return (
    <div className="flex h-screen bg-surface text-text overflow-hidden">
      <Sidebar
        files={repo.files}
        activeFile={repo.activeFile}
        onSelectFile={repo.handleSelectFile}
        onOpenFolder={repo.handleOpenFolder}
        commentCountByFile={threadState.commentCountByFile}
      />

      {repo.loading && <StatusMessage variant="loading">Loading…</StatusMessage>}

      {repo.error && <StatusMessage variant="error">{repo.error}</StatusMessage>}

      {!repo.loading && !repo.error && repo.activeFile && (
        <DiffPanel
          leftLines={repo.leftLines}
          rightLines={repo.rightLines}
          fileName={repo.activeFile}
          additions={repo.rightLines.filter((l) => l.type === 'added').length}
          deletions={repo.leftLines.filter((l) => l.type === 'removed').length}
          status={repo.files.find((f) => f.name === repo.activeFile)?.status}
          leftThreads={threadState.leftThreads}
          rightThreads={threadState.rightThreads}
          onAddComment={threadState.handleAddComment}
          onDeleteComment={threadState.handleDeleteComment}
          threads={threadState.threads}
          totalCommentCount={threadState.totalCommentCount}
          folderPath={repo.folderPath!}
        />
      )}

      {!repo.loading && !repo.error && !repo.activeFile && (
        <StatusMessage variant="empty">Select a file to view its diff</StatusMessage>
      )}
    </div>
  )
}

export default App
