import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
  })
  vi.useFakeTimers()
})

describe('useCopyToClipboard', () => {
  it('starts with isCopied false', () => {
    const { result } = renderHook(() => useCopyToClipboard())
    expect(result.current.isCopied).toBe(false)
  })

  it('sets isCopied to true after copy', () => {
    const { result } = renderHook(() => useCopyToClipboard())

    act(() => {
      result.current.copy('hello')
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello')
    expect(result.current.isCopied).toBe(true)
  })

  it('resets isCopied after the default duration', () => {
    const { result } = renderHook(() => useCopyToClipboard())

    act(() => {
      result.current.copy('hello')
    })
    expect(result.current.isCopied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(result.current.isCopied).toBe(false)
  })

  it('respects a custom reset duration', () => {
    const { result } = renderHook(() => useCopyToClipboard(500))

    act(() => {
      result.current.copy('hello')
    })

    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(result.current.isCopied).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.isCopied).toBe(false)
  })

  it('does nothing for empty string', () => {
    const { result } = renderHook(() => useCopyToClipboard())

    act(() => {
      result.current.copy('')
    })

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
    expect(result.current.isCopied).toBe(false)
  })

  it('resets timer on rapid successive copies', () => {
    const { result } = renderHook(() => useCopyToClipboard(1000))

    act(() => {
      result.current.copy('first')
    })

    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(result.current.isCopied).toBe(true)

    // Copy again before timer expires
    act(() => {
      result.current.copy('second')
    })

    // Original timer would have fired at 1000ms, but it was cleared
    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(result.current.isCopied).toBe(true)

    // Now the new timer expires
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current.isCopied).toBe(false)
  })
})
