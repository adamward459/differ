import { memo, useCallback, useRef } from 'react'
import { RiCloseLine, RiSearchLine } from '@remixicon/react'

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  'aria-label'?: string
}

const SearchInput = memo(function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  'aria-label': ariaLabel = 'Search'
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = useCallback(() => {
    onChange('')
    inputRef.current?.focus()
  }, [onChange])

  return (
    <div className="relative">
      <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full pl-8 pr-7 py-1.5 rounded-md bg-surface text-xs text-text placeholder:text-text-muted border border-border focus:outline-none focus:ring-1 focus:ring-accent"
      />
      {value && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-text-muted hover:text-text"
        >
          <RiCloseLine className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
})

export default SearchInput
