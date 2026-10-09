import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { setReducedMotion } from './test/setup'

describe('MOTIONLAB landing page', () => {
  it('has a single readable headline and named navigation', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Ideas in motion.' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Explore the experiments' }),
    ).toHaveAttribute('href', '#experiments')
  })
  it('provides a skip link targeting the focusable main landmark', () => {
    render(<App />)
    expect(
      screen.getByRole('link', { name: 'Skip to content' }),
    ).toHaveAttribute('href', '#main')
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1')
  })
  it('presents four live 2D studios and the working 3D study', () => {
    render(<App />)
    expect(screen.getAllByRole('article')).toHaveLength(5)
    expect(screen.getAllByText('Live experiment')).toHaveLength(5)
    expect(
      within(
        screen.getByRole('article', { name: 'Into the third dimension' }),
      ).getByRole('link', { name: /Open studio/ }),
    ).toBeVisible()
  })
  it.each([
    'Kinetic type',
    'SVG morphing studio',
    'Micro-interactions lab',
    'Into the third dimension',
  ])('opens and closes the %s brief', async (title) => {
    const user = userEvent.setup()
    render(<App />)
    const article = screen.getByRole('article', { name: title })
    const summary = within(article).getByText('Read the brief', {
      exact: false,
      selector: 'summary',
    })
    const details = summary.parentElement
    expect(details).not.toHaveAttribute('open')
    await user.click(summary)
    expect(details).toHaveAttribute('open')
    await user.click(summary)
    expect(details).not.toHaveAttribute('open')
  })
  it('lets the visitor pause and resume animation with clear action labels', async () => {
    const user = userEvent.setup()
    render(<App />)
    const button = screen.getByRole('button', { name: 'Pause motion' })
    expect(button).toHaveTextContent('Pause motion')
    await user.click(button)
    expect(button).toHaveTextContent('Resume motion')
    await user.click(button)
    expect(button).toHaveTextContent('Pause motion')
  })
  it('honors reduced motion at load and cannot override the device preference', () => {
    setReducedMotion(true)
    render(<App />)
    expect(
      screen.getByRole('button', {
        name: 'Reduced motion enabled by your device',
      }),
    ).toBeDisabled()
    expect(screen.getByRole('heading', { level: 1 })).toBeVisible()
  })
  it('reacts to a device preference change without discarding a manual pause', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Pause motion' }))
    act(() => setReducedMotion(true))
    expect(
      screen.getByRole('button', {
        name: 'Reduced motion enabled by your device',
      }),
    ).toBeDisabled()
    act(() => setReducedMotion(false))
    expect(
      screen.getByRole('button', { name: 'Resume motion' }),
    ).toHaveTextContent('Resume motion')
  })
})
