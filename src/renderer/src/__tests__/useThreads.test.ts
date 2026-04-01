import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useThreads } from '../hooks/useThreads'
import type { DiffLine } from '../types'

const leftLines: DiffLine[] = [
  { num: 1, content: 'hello', type: 'removed' },
  { num: 2, content: 'world', type: 'unchanged' }
]
const rightLines: DiffLine[] = [
  { num: 1, content: 'hello!', type: 'added' },
  { num: 2, content: 'world', type: 'unchanged' }
]

describe('useThreads', () => {
  it('starts with empty threads', () => {
    const { result } = renderHook(() => useThreads('file.ts', leftLines, rightLines))
    expect(result.current.threads).toEqual([])
    expect(result.current.leftThreads).toEqual({})
    expect(result.current.rightThreads).toEqual({})
  })

  it('adds a comment to a new thread', () => {
    const { result } = renderHook(() => useThreads('file.ts', leftLines, rightLines))

    act(() => {
      result.current.handleAddComment('left', 1, 'looks wrong')
    })

    expect(result.current.threads).toHaveLength(1)
    expect(result.current.threads[0].file).toBe('file.ts')
    expect(result.current.threads[0].side).toBe('left')
    expect(result.current.threads[0].line).toBe(1)
    expect(result.current.threads[0].comments).toHaveLength(1)
    expect(result.current.threads[0].comments[0].body).toBe('looks wrong')
    expect(result.current.threads[0].lineContent).toBe('hello')
  })

  it('appends comment to existing thread', () => {
    const { result } = renderHook(() => useThreads('file.ts', leftLines, rightLines))

    act(() => {
      result.current.handleAddComment('left', 1, 'first')
    })
    act(() => {
      result.current.handleAddComment('left', 1, 'second')
    })

    expect(result.current.threads).toHaveLength(1)
    expect(result.current.threads[0].comments).toHaveLength(2)
    expect(result.current.threads[0].comments[1].body).toBe('second')
  })

  it('builds leftThreads and rightThreads maps', () => {
    const { result } = renderHook(() => useThreads('file.ts', leftLines, rightLines))

    act(() => {
      result.current.handleAddComment('left', 1, 'left comment')
    })
    act(() => {
      result.current.handleAddComment('right', 1, 'right comment')
    })

    expect(result.current.leftThreads[1]).toBeDefined()
    expect(result.current.leftThreads[1].comments).toHaveLength(1)
    expect(result.current.rightThreads[1]).toBeDefined()
    expect(result.current.rightThreads[1].comments).toHaveLength(1)
  })

  it('does nothing when activeFile is null', () => {
    const { result } = renderHook(() => useThreads(null, leftLines, rightLines))

    act(() => {
      result.current.handleAddComment('left', 1, 'nope')
    })

    expect(result.current.threads).toHaveLength(0)
  })

  it('marks threads outdated when line content changes', () => {
    const { result } = renderHook(() => useThreads('file.ts', leftLines, rightLines))

    act(() => {
      result.current.handleAddComment('left', 1, 'comment')
    })

    expect(result.current.threads[0].outdated).toBe(false)

    // Simulate diff update where line 1 content changed
    const newLeft: DiffLine[] = [{ num: 1, content: 'changed', type: 'removed' }]

    act(() => {
      result.current.refreshOutdated('file.ts', newLeft, rightLines)
    })

    expect(result.current.threads[0].outdated).toBe(true)
  })

  it('preserves outdated status when appending comment to outdated thread', () => {
    const { result } = renderHook(() => useThreads('file.ts', leftLines, rightLines))

    act(() => {
      result.current.handleAddComment('left', 1, 'first comment')
    })

    // Simulate diff update where line 1 content changed
    const newLeft: DiffLine[] = [{ num: 1, content: 'changed', type: 'removed' }]
    act(() => {
      result.current.refreshOutdated('file.ts', newLeft, rightLines)
    })
    expect(result.current.threads[0].outdated).toBe(true)

    // Add another comment to the same outdated thread
    act(() => {
      result.current.handleAddComment('left', 1, 'second comment')
    })

    expect(result.current.threads[0].outdated).toBe(true)
    expect(result.current.threads[0].comments).toHaveLength(2)
    expect(result.current.threads[0].lineContent).toBe('hello')
  })

  it('preserves original lineContent when appending to existing thread', () => {
    const initialLeft: DiffLine[] = [{ num: 1, content: 'original', type: 'removed' }]
    const { result, rerender } = renderHook(({ left }) => useThreads('file.ts', left, rightLines), {
      initialProps: { left: initialLeft }
    })

    act(() => {
      result.current.handleAddComment('left', 1, 'first')
    })
    expect(result.current.threads[0].lineContent).toBe('original')

    // Diff changes — new content on same line number
    const newLeft: DiffLine[] = [{ num: 1, content: 'modified', type: 'removed' }]
    rerender({ left: newLeft })

    act(() => {
      result.current.handleAddComment('left', 1, 'second')
    })

    // lineContent should still reflect the original snapshot
    expect(result.current.threads[0].lineContent).toBe('original')
  })

  it('marks thread outdated when line is removed from diff', () => {
    const { result } = renderHook(() => useThreads('file.ts', leftLines, rightLines))

    act(() => {
      result.current.handleAddComment('left', 1, 'comment')
    })

    // New diff has no line 1 at all
    const emptyLeft: DiffLine[] = []
    act(() => {
      result.current.refreshOutdated('file.ts', emptyLeft, rightLines)
    })

    expect(result.current.threads[0].outdated).toBe(true)
  })

  it('does not mark thread outdated when content is the same', () => {
    const { result } = renderHook(() => useThreads('file.ts', leftLines, rightLines))

    act(() => {
      result.current.handleAddComment('left', 1, 'comment')
    })

    act(() => {
      result.current.refreshOutdated('file.ts', leftLines, rightLines)
    })

    expect(result.current.threads[0].outdated).toBe(false)
  })
})
