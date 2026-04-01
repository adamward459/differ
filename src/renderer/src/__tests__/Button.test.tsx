import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../components/common/Button'

function MockIcon({ className }: { className?: string }) {
  return <svg data-testid="icon" className={className} />
}

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(<Button icon={MockIcon}>Label</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('calls onClick', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Nope</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders without icon', () => {
    render(<Button>Text only</Button>)
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
    expect(screen.getByText('Text only')).toBeInTheDocument()
  })
})
