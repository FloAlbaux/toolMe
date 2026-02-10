import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingHighlight } from './LandingHighlight'

describe('LandingHighlight', () => {
  it('renders title and lead', () => {
    render(<LandingHighlight />)
    expect(screen.getByRole('heading', { level: 3, name: 'Real projects. Useful work. Yours.' })).toBeInTheDocument()
    expect(screen.getByText('Discover and contribute to real projects, for free.')).toBeInTheDocument()
  })

  it('renders the four value pills', () => {
    render(<LandingHighlight />)
    expect(screen.getByText('Real projects')).toBeInTheDocument()
    expect(screen.getByText('Useful work')).toBeInTheDocument()
    expect(screen.getByText('For everyone')).toBeInTheDocument()
    expect(screen.getByText('Fully free')).toBeInTheDocument()
  })

  it('renders sandbox metaphor', () => {
    render(<LandingHighlight />)
    expect(screen.getByText('A sandbox with you, not above you.')).toBeInTheDocument()
  })

  it('has accessible section with sr-only heading', () => {
    render(<LandingHighlight />)
    const section = screen.getByRole('region', { name: 'Why ToolMe' })
    expect(section).toBeInTheDocument()
  })
})
