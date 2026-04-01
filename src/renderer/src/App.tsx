import { useCallback, useState } from 'react';
import { RiRefreshLine, RiArrowGoBackLine } from '@remixicon/react';
import Sidebar from './components/sidebar/Sidebar';
import DiffPanel from './components/diff/DiffPanel';
import LandingView from './components/common/LandingView';
import StatusMessage from './components/common/StatusMessage';
import Button from './components/common/Button';
import { useRepo } from './hooks/useRepo';
import { useThreads } from './hooks/useThreads';
import { useMockDemo } from './hooks/useMockDemo';
import type { DiffLine } from './types';

/** Set to true to use mock data with a "Simulate change" button. */
const DEMO_MODE = false;

function DemoApp(): React.JSX.Element {
  const demo = useMockDemo();

  return (
    <div className="flex h-screen bg-surface text-text overflow-hidden">
      <Sidebar
        files={demo.files}
        activeFile={demo.activeFile}
        onSelectFile={demo.handleSelectFile}
        onOpenFolder={() => {}}
      />
      {demo.activeFile && (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-border bg-surface-alt">
            <span className="text-[11px] text-text-muted">
              Demo: comments are pre-seeded on lines 6–7. Click &quot;Simulate
              change&quot; to see them go outdated.
            </span>
            <span className="flex-1" />
            {!demo.changed ? (
              <Button
                icon={RiRefreshLine}
                variant="accent"
                size="sm"
                onClick={demo.simulateChange}
              >
                Simulate change
              </Button>
            ) : (
              <Button
                icon={RiArrowGoBackLine}
                variant="ghost"
                size="sm"
                onClick={demo.resetDemo}
              >
                Reset
              </Button>
            )}
          </div>
          <DiffPanel
            leftLines={demo.left}
            rightLines={demo.right}
            fileName={demo.activeFile}
            additions={demo.right.filter(l => l.type === 'added').length}
            deletions={demo.left.filter(l => l.type === 'removed').length}
            status="modified"
            leftThreads={demo.threadState.leftThreads}
            rightThreads={demo.threadState.rightThreads}
            onAddComment={demo.threadState.handleAddComment}
            onDeleteComment={demo.threadState.handleDeleteComment}
            threads={demo.threadState.threads}
          />
        </div>
      )}
    </div>
  );
}

function RealApp(): React.JSX.Element {
  const [activeDiff, setActiveDiff] = useState<{
    file: string | null;
    left: DiffLine[];
    right: DiffLine[];
  }>({ file: null, left: [], right: [] });

  const threadState = useThreads(
    activeDiff.file,
    activeDiff.left,
    activeDiff.right,
  );

  const handleDiffUpdated = useCallback(
    (file: string, left: DiffLine[], right: DiffLine[]) => {
      setActiveDiff({ file, left, right });
      threadState.refreshOutdated(file, left, right);
    },
    [threadState.refreshOutdated],
  );

  const repo = useRepo(handleDiffUpdated);

  if (!repo.folderPath) {
    return <LandingView onOpenFolder={repo.handleOpenFolder} />;
  }

  return (
    <div className="flex h-screen bg-surface text-text overflow-hidden">
      <Sidebar
        files={repo.files}
        activeFile={repo.activeFile}
        onSelectFile={repo.handleSelectFile}
        onOpenFolder={repo.handleOpenFolder}
      />

      {repo.loading && (
        <StatusMessage variant="loading">Loading…</StatusMessage>
      )}

      {repo.error && (
        <StatusMessage variant="error">{repo.error}</StatusMessage>
      )}

      {!repo.loading && !repo.error && repo.activeFile && (
        <DiffPanel
          leftLines={repo.leftLines}
          rightLines={repo.rightLines}
          fileName={repo.activeFile}
          additions={repo.rightLines.filter(l => l.type === 'added').length}
          deletions={repo.leftLines.filter(l => l.type === 'removed').length}
          status={repo.files.find(f => f.name === repo.activeFile)?.status}
          leftThreads={threadState.leftThreads}
          rightThreads={threadState.rightThreads}
          onAddComment={threadState.handleAddComment}
          onDeleteComment={threadState.handleDeleteComment}
          threads={threadState.threads}
        />
      )}

      {!repo.loading && !repo.error && !repo.activeFile && (
        <StatusMessage variant="empty">
          Select a file to view its diff
        </StatusMessage>
      )}
    </div>
  );
}

export default function App(): React.JSX.Element {
  return DEMO_MODE ? <DemoApp /> : <RealApp />;
}
