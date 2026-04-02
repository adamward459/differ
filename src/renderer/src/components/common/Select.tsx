import { memo, type ReactNode } from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { RiArrowDownSLine, RiCheckLine } from '@remixicon/react'

export interface SelectOption {
  value: string
  label: string
}

const Select = memo(function Select({
  value,
  onChange,
  options,
  icon,
  placeholder = 'Select…',
  ariaLabel
}: {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  icon?: ReactNode
  placeholder?: string
  ariaLabel?: string
}) {
  return (
    <RadixSelect.Root value={value} onValueChange={onChange}>
      <RadixSelect.Trigger
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-mono text-text-secondary hover:text-text hover:bg-surface-hover transition-colors outline-none"
        aria-label={ariaLabel}
      >
        {icon}
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <RiArrowDownSLine size={12} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 bg-surface-overlay border border-border rounded-lg shadow-lg py-1 min-w-[var(--radix-select-trigger-width)]"
        >
          <RadixSelect.Viewport>
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-mono text-text-secondary outline-none cursor-pointer data-[highlighted]:bg-surface-hover data-[highlighted]:text-text data-[state=checked]:text-accent"
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <RiCheckLine size={12} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
})

export default Select
