import { memo, useCallback, useMemo, useEffect } from 'react'
import { RiCodeBoxLine } from '@remixicon/react'
import Select from './Select'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import type { IDE } from '../../types'
import { IDE_LIST } from '../../types'

const options = IDE_LIST.map((ide) => ({ value: ide.id, label: ide.label }))

const IDESelector = memo(function IDESelector({ onSelect }: { onSelect: (ide: IDE) => void }) {
  const [selectedId, setSelectedId] = useLocalStorage('differ-selected-ide', IDE_LIST[0].id)

  const selectedIde = useMemo(
    () => IDE_LIST.find((i) => i.id === selectedId) ?? IDE_LIST[0],
    [selectedId]
  )

  const handleChange = useCallback(
    (value: string) => {
      setSelectedId(value)
      const ide = IDE_LIST.find((i) => i.id === value) ?? IDE_LIST[0]
      onSelect(ide)
    },
    [setSelectedId, onSelect]
  )

  // Notify parent of initial selection
  useEffect(() => {
    onSelect(selectedIde)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Select
      value={selectedId}
      onChange={handleChange}
      options={options}
      icon={<RiCodeBoxLine size={14} />}
      ariaLabel={`Open in ${selectedIde.label}`}
    />
  )
})

export default IDESelector
