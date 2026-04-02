import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../hooks/useLocalStorage'

beforeEach(() => {
  localStorage.clear()
})

describe('useLocalStorage', () => {
  it('returns the fallback when key is absent', () => {
    const { result } = renderHook(() => useLocalStorage('differ-selected-ide', 'vscode'))
    expect(result.current[0]).toBe('vscode')
  })

  it('reads an existing value from localStorage', () => {
    localStorage.setItem('differ-selected-ide', JSON.stringify('cursor'))
    const { result } = renderHook(() => useLocalStorage('differ-selected-ide', 'vscode'))
    expect(result.current[0]).toBe('cursor')
  })

  it('writes to localStorage on set', () => {
    const { result } = renderHook(() => useLocalStorage('differ-selected-ide', 'vscode'))
    act(() => {
      result.current[1]('webstorm')
    })
    expect(result.current[0]).toBe('webstorm')
    expect(localStorage.getItem('differ-selected-ide')).toBe(JSON.stringify('webstorm'))
  })

  it('returns fallback when stored value is invalid JSON', () => {
    localStorage.setItem('differ-selected-ide', '{bad')
    const { result } = renderHook(() => useLocalStorage('differ-selected-ide', 'vscode'))
    expect(result.current[0]).toBe('vscode')
  })

  it('survives localStorage.getItem throwing', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { result } = renderHook(() => useLocalStorage('differ-selected-ide', 'vscode'))
    expect(result.current[0]).toBe('vscode')
    spy.mockRestore()
  })

  it('survives localStorage.setItem throwing (quota exceeded)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const { result } = renderHook(() => useLocalStorage('differ-selected-ide', 'vscode'))
    act(() => {
      result.current[1]('cursor')
    })
    // State still updates even if persistence fails
    expect(result.current[0]).toBe('cursor')
    spy.mockRestore()
  })
})
