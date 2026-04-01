import { memo } from 'react'

const StatusMessage = memo(function StatusMessage({
  variant,
  children
}: {
  variant: 'loading' | 'error' | 'empty'
  children: React.ReactNode
}) {
  if (variant === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-[13px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span>{children}</span>
        </div>
      </div>
    )
  }

  if (variant === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center text-[13px]">
        <div className="px-4 py-3 rounded-xl bg-diff-rm-bg text-diff-rm">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center text-text-muted text-[13px]">
      {children}
    </div>
  )
})

export default StatusMessage
