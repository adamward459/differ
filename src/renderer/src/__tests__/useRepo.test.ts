import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRepo } from '../hooks/useRepo';
import type { DiffLine } from '../types';

// ── Helpers ──

let repoChangedCb: (() => void) | null = null;

const mockApi = {
  openFolder: vi.fn(),
  getChangedFiles: vi.fn(),
  getFileDiff: vi.fn(),
  watchRepo: vi.fn(),
  unwatchRepo: vi.fn(),
  onRepoChanged: vi.fn((cb: () => void) => {
    repoChangedCb = cb;
    return () => {
      repoChangedCb = null;
    };
  }),
  getOpenAtLogin: vi.fn().mockResolvedValue(false),
  setOpenAtLogin: vi.fn(),
};

function emitRepoChanged(): Promise<void> {
  // Trigger the stored callback and flush microtasks
  if (repoChangedCb) repoChangedCb();
  return new Promise(r => setTimeout(r, 0));
}

const leftA: DiffLine[] = [{ num: 1, content: 'aaa', type: 'removed' }];
const rightA: DiffLine[] = [{ num: 1, content: 'bbb', type: 'added' }];
const leftA2: DiffLine[] = [{ num: 1, content: 'aaa-v2', type: 'removed' }];
const rightA2: DiffLine[] = [{ num: 1, content: 'bbb-v2', type: 'added' }];

beforeEach(() => {
  repoChangedCb = null;
  vi.clearAllMocks();
  (window as unknown as { api: typeof mockApi }).api = mockApi;
});

// ── Tests ──

describe('useRepo', () => {
  it('selects a file and applies its diff', async () => {
    mockApi.openFolder.mockResolvedValue('/repo');
    mockApi.getChangedFiles.mockResolvedValue({
      files: [{ name: 'a.ts', status: 'modified' }],
    });
    mockApi.getFileDiff.mockResolvedValue({
      leftLines: leftA,
      rightLines: rightA,
    });

    const onDiffUpdated = vi.fn();
    const { result } = renderHook(() => useRepo(onDiffUpdated));

    // Open folder
    await act(() => result.current.handleOpenFolder());

    expect(result.current.folderPath).toBe('/repo');
    expect(result.current.files).toHaveLength(1);

    // Select file
    await act(() => result.current.handleSelectFile('a.ts'));

    expect(result.current.activeFile).toBe('a.ts');
    expect(result.current.leftLines).toEqual(leftA);
    expect(result.current.rightLines).toEqual(rightA);
    expect(onDiffUpdated).toHaveBeenCalledWith('a.ts', leftA, rightA);
  });

  it('propagates file changes via onRepoChanged for the active file', async () => {
    mockApi.openFolder.mockResolvedValue('/repo');
    mockApi.getChangedFiles.mockResolvedValue({
      files: [{ name: 'a.ts', status: 'modified' }],
    });
    mockApi.getFileDiff.mockResolvedValue({
      leftLines: leftA,
      rightLines: rightA,
    });

    const onDiffUpdated = vi.fn();
    const { result } = renderHook(() => useRepo(onDiffUpdated));

    await act(() => result.current.handleOpenFolder());
    await act(() => result.current.handleSelectFile('a.ts'));

    onDiffUpdated.mockClear();

    // Now the file changes on disk — watcher fires with updated diff
    mockApi.getChangedFiles.mockResolvedValue({
      files: [{ name: 'a.ts', status: 'modified' }],
    });
    mockApi.getFileDiff.mockResolvedValue({
      leftLines: leftA2,
      rightLines: rightA2,
    });

    await act(() => emitRepoChanged());

    expect(result.current.leftLines).toEqual(leftA2);
    expect(result.current.rightLines).toEqual(rightA2);
    expect(onDiffUpdated).toHaveBeenCalledWith('a.ts', leftA2, rightA2);
  });

  it('propagates changes even when onDiffUpdated callback identity changes', async () => {
    mockApi.openFolder.mockResolvedValue('/repo');
    mockApi.getChangedFiles.mockResolvedValue({
      files: [{ name: 'a.ts', status: 'modified' }],
    });
    mockApi.getFileDiff.mockResolvedValue({
      leftLines: leftA,
      rightLines: rightA,
    });

    // Start with one callback, then swap it — simulates the parent
    // re-creating handleDiffUpdated (e.g. because a dep changed).
    const onDiffUpdated1 = vi.fn();
    const onDiffUpdated2 = vi.fn();

    const { result, rerender } = renderHook(({ cb }) => useRepo(cb), {
      initialProps: { cb: onDiffUpdated1 },
    });

    await act(() => result.current.handleOpenFolder());
    await act(() => result.current.handleSelectFile('a.ts'));

    // Swap the callback — this used to cause the effect to re-run,
    // killing the FS watcher via unwatchRepo().
    rerender({ cb: onDiffUpdated2 });

    // File changes on disk
    mockApi.getChangedFiles.mockResolvedValue({
      files: [{ name: 'a.ts', status: 'modified' }],
    });
    mockApi.getFileDiff.mockResolvedValue({
      leftLines: leftA2,
      rightLines: rightA2,
    });

    await act(() => emitRepoChanged());

    // The NEW callback should be called (not the old one)
    expect(onDiffUpdated2).toHaveBeenCalledWith('a.ts', leftA2, rightA2);
    expect(result.current.leftLines).toEqual(leftA2);
    expect(result.current.rightLines).toEqual(rightA2);
  });

  it('does not call unwatchRepo when onDiffUpdated changes', async () => {
    mockApi.openFolder.mockResolvedValue('/repo');
    mockApi.getChangedFiles.mockResolvedValue({
      files: [{ name: 'a.ts', status: 'modified' }],
    });
    mockApi.getFileDiff.mockResolvedValue({
      leftLines: leftA,
      rightLines: rightA,
    });

    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const { result, rerender } = renderHook(({ cb }) => useRepo(cb), {
      initialProps: { cb: cb1 },
    });

    await act(() => result.current.handleOpenFolder());
    mockApi.unwatchRepo.mockClear();

    // Swap callback — previously this triggered effect cleanup → unwatchRepo
    rerender({ cb: cb2 });

    expect(mockApi.unwatchRepo).not.toHaveBeenCalled();
  });

  it('clears active file when it disappears from changed files', async () => {
    mockApi.openFolder.mockResolvedValue('/repo');
    mockApi.getChangedFiles.mockResolvedValue({
      files: [{ name: 'a.ts', status: 'modified' }],
    });
    mockApi.getFileDiff.mockResolvedValue({
      leftLines: leftA,
      rightLines: rightA,
    });

    const onDiffUpdated = vi.fn();
    const { result } = renderHook(() => useRepo(onDiffUpdated));

    await act(() => result.current.handleOpenFolder());
    await act(() => result.current.handleSelectFile('a.ts'));

    expect(result.current.activeFile).toBe('a.ts');

    // File was committed — no longer in changed list
    mockApi.getChangedFiles.mockResolvedValue({ files: [] });

    await act(() => emitRepoChanged());

    expect(result.current.activeFile).toBeNull();
    expect(result.current.leftLines).toEqual([]);
    expect(result.current.rightLines).toEqual([]);
  });

  it('calls unwatchRepo on unmount', async () => {
    const onDiffUpdated = vi.fn();
    const { unmount } = renderHook(() => useRepo(onDiffUpdated));

    mockApi.unwatchRepo.mockClear();
    unmount();

    expect(mockApi.unwatchRepo).toHaveBeenCalledTimes(1);
  });
});
