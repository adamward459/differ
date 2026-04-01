import { memo, useState, useCallback, type RefObject } from 'react'
import DiffLineRow from './DiffLineRow'
import CommentThread from '../comments/CommentThread'
import type { DiffLine, DiffSide, ThreadMap } from '../../types'

const DiffColumn = memo(function DiffColumn({
  lines,
  label,
  side,
  threads,
  onAddComment,
  onDeleteComment,
  scrollRef,
  onScroll
}: {
  lines: DiffLine[]
  label: string
  side: DiffSide
  threads: ThreadMap
  onAddComment: (side: DiffSide, line: number, body: string) => void
  onDeleteComment: (side: DiffSide, line: number, commentId: string) => void
  scrollRef: RefObject<HTMLDivElement | null>
  onScroll: (source: DiffSide) => void
}) {
  const [openLine, setOpenLine] = useState<number | null>(null)

  const handleAdd = useCallback(
    (line: number, body: string) => {
      onAddComment(side, line, body)
    },
    [side, onAddComment]
  )

  const handleDelete = useCallback(
    (line: number, commentId: string) => {
      onDeleteComment(side, line, commentId)
    },
    [side, onDeleteComment]
  )

  const handleClose = useCallback(() => setOpenLine(null), [])

  const handleScroll = useCallback(() => onScroll(side), [side, onScroll])

  const handleToggle = useCallback((lineNum: number) => {
    setOpenLine((prev) => (prev === lineNum ? null : lineNum))
  }, [])

  const handleOpen = useCallback((lineNum: number) => {
    setOpenLine(lineNum)
  }, [])

  return (
    <div className="flex-1 min-w-0 overflow-auto" ref={scrollRef} onScroll={handleScroll}>
      <div className="sticky top-0 z-10 bg-surface-overlay backdrop-blur-md border-b border-border-subtle px-4 py-2">
        <span className="text-[11px] text-text-muted font-mono tracking-wide">{label}</span>
      </div>
      <div className="font-mono text-[13px] leading-7">
        {lines.map((line, idx) => {
          const key = line.type === 'placeholder' ? `ph-${idx}` : `${line.type}-${line.num}`
          const hasThread = threads[line.num]?.comments?.length > 0
          const isOpen = openLine === line.num

          return (
            <div key={key}>
              <DiffLineRow
                line={line}
                side={side}
                hasThread={hasThread}
                isOpen={isOpen}
                onToggle={handleToggle}
                onOpen={handleOpen}
              />
              {isOpen && line.type !== 'placeholder' && (
                <CommentThread
                  comments={threads[line.num]?.comments ?? []}
                  outdated={threads[line.num]?.outdated ?? false}
                  onAdd={(body) => handleAdd(line.num, body)}
                  onDelete={(commentId) => handleDelete(line.num, commentId)}
                  onClose={handleClose}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default DiffColumn
