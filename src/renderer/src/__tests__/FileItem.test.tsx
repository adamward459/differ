import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FileItem from '../components/sidebar/FileItem'

describe('FileItem', () => {
  it('renders file name', () => {
    render(<FileItem name="src/app.ts" additions={0} deletions={0} active={false} />)
    expect(screen.getByText('src/app.ts')).toBeInTheDocument()
  })

  it('renders status badge when status is provided', () => {
    render(<FileItem name="f.ts" additions={0} deletions={0} status="modified" active={false} />)
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('renders additions and deletions when non-zero', () => {
    render(<FileItem name="f.ts" additions={3} deletions={2} active={false} />)
    expect(screen.getByText('+3')).toBeInTheDocument()
    expect(screen.getByText('−2')).toBeInTheDocument()
  })

  it('does not render stats when both are zero', () => {
    const { container } = render(
      <FileItem name="f.ts" additions={0} deletions={0} active={false} />
    )
    expect(container.querySelector('.text-diff-add')).not.toBeInTheDocument()
    expect(container.querySelector('.text-diff-rm')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<FileItem name="f.ts" additions={0} deletions={0} active={false} onClick={onClick} />)
    fireEvent.click(screen.getByRole('option'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('sets aria-selected when active', () => {
    render(<FileItem name="f.ts" additions={0} deletions={0} active={true} />)
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true')
  })

  it('sets tabIndex 0 when active, -1 when not', () => {
    const { rerender } = render(<FileItem name="f.ts" additions={0} deletions={0} active={true} />)
    expect(screen.getByRole('option')).toHaveAttribute('tabindex', '0')

    rerender(<FileItem name="f.ts" additions={0} deletions={0} active={false} />)
    expect(screen.getByRole('option')).toHaveAttribute('tabindex', '-1')
  })
})
