import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DiffStats from '../components/common/DiffStats'

describe('DiffStats', () => {
  it('renders additions and deletions', () => {
    render(<DiffStats additions={5} deletions={3} />)
    expect(screen.getByText('+5')).toBeInTheDocument()
    expect(screen.getByText('−3')).toBeInTheDocument()
  })

  it('renders nothing when both are zero', () => {
    const { container } = render(<DiffStats additions={0} deletions={0} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders only additions when deletions are zero', () => {
    render(<DiffStats additions={10} deletions={0} />)
    expect(screen.getByText('+10')).toBeInTheDocument()
    expect(screen.queryByText(/−/)).not.toBeInTheDocument()
  })

  it('renders only deletions when additions are zero', () => {
    render(<DiffStats additions={0} deletions={7} />)
    expect(screen.getByText('−7')).toBeInTheDocument()
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument()
  })
})
