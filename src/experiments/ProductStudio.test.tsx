import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MotionProvider } from '../motion/MotionProvider'
import { setReducedMotion } from '../test/setup'
import ProductStudio from './ProductStudio'
import { supportsWebGL } from '../three/supportsWebGL'
import { ViewerBoundary } from '../three/ViewerBoundary'
vi.mock('../three/ProductScene', () => ({
  default: ({
    settings,
  }: {
    settings: { reset: number; colour: { name: string }; exploded: boolean }
  }) => (
    <div aria-label="Mock renderer" data-reset={settings.reset}>
      {settings.colour.name} {settings.exploded ? 'separated' : 'assembled'}
    </div>
  ),
}))
function renderStudio() {
  return render(
    <MotionProvider>
      <ProductStudio />
    </MotionProvider>,
  )
}
describe('AURA product controls', () => {
  it.each(['Obsidian', 'Amethyst', 'Glacier', 'Chalk'])(
    'selects %s with visible and announced feedback',
    async (name) => {
      const user = userEvent.setup()
      renderStudio()
      await user.click(screen.getByRole('button', { name }))
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(screen.getByRole('status')).toHaveTextContent(
        `${name} colourway selected`,
      )
    },
  )
  it('toggles automatic rotation and disables it when global motion pauses', async () => {
    const user = userEvent.setup()
    renderStudio()
    const auto = screen.getByRole('button', { name: 'Automatic rotation' })
    await user.click(auto)
    expect(auto).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Pause motion' }))
    expect(auto).toBeDisabled()
  })
  it('toggles exploded construction using the keyboard', async () => {
    const user = userEvent.setup()
    renderStudio()
    const button = screen.getByRole('button', { name: 'Exploded view' })
    button.focus()
    await user.keyboard(' ')
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('separated')
    await user.keyboard(' ')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })
  it('resets the camera and automatic rotation', async () => {
    const user = userEvent.setup()
    renderStudio()
    await user.click(screen.getByRole('button', { name: 'Automatic rotation' }))
    await user.click(screen.getByRole('button', { name: 'Rotate left' }))
    await user.click(screen.getByRole('button', { name: 'Reset camera' }))
    expect(
      screen.getByRole('button', { name: 'Automatic rotation' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('status')).toHaveTextContent('Camera reset')
    expect(await screen.findByLabelText('Mock renderer')).toHaveAttribute(
      'data-reset',
      '1',
    )
  })
  it('respects live reduced motion while keeping colour selection available', async () => {
    const user = userEvent.setup()
    renderStudio()
    act(() => setReducedMotion(true))
    expect(
      screen.getByRole('button', { name: 'Automatic rotation' }),
    ).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Glacier' }))
    expect(screen.getByRole('status')).toHaveTextContent('Glacier')
  })
  it('offers a static illustration with matching colours and assembly state', async () => {
    const user = userEvent.setup()
    renderStudio()
    await user.click(
      screen.getByRole('button', { name: 'Static illustration' }),
    )
    await user.click(screen.getByRole('button', { name: 'Chalk' }))
    await user.click(screen.getByRole('button', { name: 'Exploded view' }))
    expect(
      screen.getByRole('img', { name: /Chalk, exploded static/ }),
    ).toBeVisible()
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled()
    expect(screen.queryByLabelText('Mock renderer')).not.toBeInTheDocument()
  })
  it('bounds zoom rather than letting the camera enter the geometry', async () => {
    const user = userEvent.setup()
    renderStudio()
    const zoom = screen.getByRole('button', { name: 'Zoom in' })
    for (let i = 0; i < 5; i++) await user.click(zoom)
    expect(zoom).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Reset camera' }))
    expect(zoom).toBeEnabled()
  })
  it('detects unsupported WebGL without throwing', () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null)
    expect(supportsWebGL()).toBe(false)
    spy.mockRestore()
  })
  it('releases the temporary feature detection context', () => {
    const loseContext = vi.fn()
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({
        getExtension: () => ({ loseContext }),
      } as unknown as WebGL2RenderingContext)
    expect(supportsWebGL()).toBe(true)
    expect(loseContext).toHaveBeenCalledOnce()
    spy.mockRestore()
  })
  it('replaces a failed renderer with accessible fallback content', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onFailure = vi.fn()
    function Broken(): never {
      throw new Error('Renderer failed')
    }
    render(
      <ViewerBoundary
        fallback={<p>Static product available</p>}
        onFailure={onFailure}
      >
        <Broken />
      </ViewerBoundary>,
    )
    expect(screen.getByText('Static product available')).toBeVisible()
    expect(onFailure).toHaveBeenCalledOnce()
    errors.mockRestore()
  })
})
