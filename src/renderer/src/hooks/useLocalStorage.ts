import { useState, useCallback } from 'react'

/** Registry of known storage keys and their value types. Extend via declaration merging. */
export interface StorageKeyMap {
  'differ-selected-ide': string
}

type StorageKey = keyof StorageKeyMap

function read<K extends StorageKey>(key: K, fallback: StorageKeyMap[K]): StorageKeyMap[K] {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? (JSON.parse(raw) as StorageKeyMap[K]) : fallback
  } catch {
    return fallback
  }
}

export function useLocalStorage<K extends StorageKey>(
  key: K,
  fallback: StorageKeyMap[K]
): [StorageKeyMap[K], (value: StorageKeyMap[K]) => void] {
  const [value, setValue] = useState<StorageKeyMap[K]>(() => read(key, fallback))

  const set = useCallback(
    (next: StorageKeyMap[K]) => {
      setValue(next)
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // quota exceeded — non-critical
      }
    },
    [key]
  )

  return [value, set]
}
