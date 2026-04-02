import { memo } from 'react'
import { RiAddLine, RiChat3Line } from '@remixicon/react'
import IconButton from '../common/IconButton'
import type { DiffLine, DiffSide, LineType } from '../../types'

const lineColor: Record<LineType, string> = {
  added: 'bg-diff-add-bg text-diff-add',
  removed: 'bg-diff-rm-bg text-diff-rm',
  unchanged: 'text-text-secondary',
  placeholder: 'bg-surface-alt'
}

const gutterColor: Record<LineType, string> = {
  added: 'text-diff-add-gutter',
  removed: 'text-diff-rm-gutter',
  unchanged: 'text-text-muted',
  placeholder: 'text-transparent'
}

const prefixChar: Record<LineType, string> = {
  added: '+',
  removed: '−',
  unchanged: ' ',
  placeholder: ' '
}

function ActionButtons({
  lineNum,
  hasThread,
  isOpen,
  onToggle,
  onOpen
}: {
  lineNum: number
  hasThread: boolean
  isOpen: boolean
  onToggle: (lineNum: number) => void
  onOpen: (lineNum: number) => void
}) {
  return (
    <span className="shrink-0 flex items-center px-1 gap-0.5">
      {hasThread && !isOpen && (
        <IconButton
          icon={RiChat3Line}
          variant="accent"
          size="sm"
          onClick={() => onToggle(lineNum)}
          className="!p-0.5 !rounded-md"
          aria-label={`View comments on line ${lineNum}`}
          title={`View comments on line ${lineNum}`}
        />
      )}
      <IconButton
        icon={RiAddLine}
        variant="ghost"
        size="sm"
        onClick={() => onOpen(lineNum)}
        className="!p-0.5 !rounded-md opacity-0 group-hover/line:opacity-100"
        aria-label={`Add comment on line ${lineNum}`}
        title={`Add comment on line ${lineNum}`}
      />
    </span>
  )
}

const DiffLineRow = memo(function DiffLineRow({
  line,
  side,
  hasThread,
  isOpen,
  onToggle,
  onOpen,
  onOpenInIde
}: {
  line: DiffLine
  side: DiffSide
  hasThread: boolean
  isOpen: boolean
  onToggle: (lineNum: number) => void
  onOpen: (lineNum: number) => void
  onOpenInIde: (lineNum: number) => void
}) {
  if (line.type === 'placeholder') {
    return (
      <div className={`flex ${lineColor.placeholder}`}>
        {side === 'right' && <span className="shrink-0 w-6">&nbsp;</span>}
        <span className="shrink-0 w-12">&nbsp;</span>
        <span className="shrink-0 w-5">&nbsp;</span>
        <span className="flex-1">&nbsp;</span>
        {side === 'left' && <span className="shrink-0 w-6">&nbsp;</span>}
      </div>
    )
  }

  return (
    <div
      className={`group/line flex ${lineColor[line.type]} relative transition-colors duration-75`}
    >
      {side === 'right' && (
        <ActionButtons
          lineNum={line.num}
          hasThread={hasThread}
          isOpen={isOpen}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      )}
      <span
        className={`shrink-0 w-12 text-right pr-3 select-none text-[12px] ${gutterColor[line.type]} cursor-pointer hover:underline`}
        onClick={() => onOpenInIde(line.num)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onOpenInIde(line.num)
        }}
        title={`Open line ${line.num} in IDE`}
      >
        {line.num}
      </span>
      <span
        className={`shrink-0 w-5 select-none text-center font-medium ${
          line.type === 'added'
            ? 'text-diff-add'
            : line.type === 'removed'
              ? 'text-diff-rm'
              : 'text-transparent'
        }`}
      >
        {prefixChar[line.type]}
      </span>
      <span className="whitespace-pre-wrap break-all pr-4 flex-1">{line.content || ' '}</span>
      {side === 'left' && (
        <ActionButtons
          lineNum={line.num}
          hasThread={hasThread}
          isOpen={isOpen}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      )}
    </div>
  )
})

export default DiffLineRow
