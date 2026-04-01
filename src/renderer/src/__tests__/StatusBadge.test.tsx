import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from '../components/common/StatusBadge'

describe('StatusBadge', () => {
  it('renders full label by default', () => {
    render(<StatusBadge status="modified" />)
    expect(screen.getByText('modified')).toBeInTheDocument()
  })

  it('renders abbreviated label in compact mode', () => {
    render(<StatusBadge status="modified" compact />)
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('renders correct label for each status', () => {
    const cases: Array<{
      status: 'added' | 'deleted' | 'renamed' | 'untracked'
      label: string
    }> = [
      { status: 'added', label: 'added' },
      { status: 'deleted', label: 'deleted' },
      { status: 'renamed', label: 'renamed' },
      { status: 'untracked', label: 'untracked' }
    ]
    for (const { status, label } of cases) {
      const { unmount } = render(<StatusBadge status={status} />)
      expect(screen.getByText(label)).toBeInTheDocument()
      unmount()
    }
  })

  it('renders compact abbreviations for each status', () => {
    const cases: Array<{
      status: 'added' | 'deleted' | 'renamed' | 'untracked'
      abbr: string
    }> = [
      { status: 'added', abbr: 'A' },
      { status: 'deleted', abbr: 'D' },
      { status: 'renamed', abbr: 'R' },
      { status: 'untracked', abbr: 'U' }
    ]
    for (const { status, abbr } of cases) {
      const { unmount } = render(<StatusBadge status={status} compact />)
      expect(screen.getByText(abbr)).toBeInTheDocument()
      unmount()
    }
  })
})
