import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusMessage from '../components/common/StatusMessage'

describe('StatusMessage', () => {
  it('renders loading variant with spinner', () => {
    const { container } = render(<StatusMessage variant="loading">Loading…</StatusMessage>)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders error variant', () => {
    render(<StatusMessage variant="error">Something broke</StatusMessage>)
    expect(screen.getByText('Something broke')).toBeInTheDocument()
  })

  it('renders empty variant', () => {
    render(<StatusMessage variant="empty">No data</StatusMessage>)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })
})
