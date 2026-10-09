import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MotionProvider } from '../motion/MotionProvider'
import { setReducedMotion } from '../test/setup'
import KineticTypography from './KineticTypography'
import SvgMorphing from './SvgMorphing'
import MicroInteractions from './MicroInteractions'
import { createShapePath, shapes } from '../utils/svgShapes'

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute('open')
    },
  })
})
function show(component: React.ReactNode) {
  return render(<MotionProvider>{component}</MotionProvider>)
}
describe('Typography studio', () => {
  it.each(['Characters', 'Words', 'Split', 'Emphasis'])(
    'selects %s and replays a controllable timeline',
    async (style) => {
      const user = userEvent.setup()
      show(<KineticTypography />)
      await user.click(screen.getByRole('button', { name: style }))
      expect(screen.getByRole('button', { name: style })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await user.click(screen.getByRole('button', { name: 'Pause animation' }))
      expect(screen.getByRole('status')).toHaveTextContent('Paused')
      await user.click(screen.getByRole('button', { name: 'Replay' }))
      expect(screen.getByRole('status')).toHaveTextContent('Playing')
    },
  )
  it('edits its readable text and changes speed', async () => {
    const user = userEvent.setup()
    show(<KineticTypography />)
    await user.clear(screen.getByLabelText(/Your words/))
    await user.type(screen.getByLabelText(/Your words/), 'Think clearly.')
    expect(
      screen.getByText('Think clearly.', { selector: '.sr-only' }),
    ).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Animation speed'), '2')
    expect(screen.getByLabelText('Animation speed')).toHaveValue('2')
  })
  it('keeps text and style selection usable when reduced motion changes live', () => {
    show(<KineticTypography />)
    act(() => setReducedMotion(true))
    expect(
      screen.getByRole('button', { name: 'Play animation' }),
    ).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Split' }))
    expect(screen.getByRole('button', { name: 'Split' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      screen.getByText('Make it move.', { selector: '.sr-only' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Static preview')
  })
})
describe('Morphing studio', () => {
  it.each(['Bloom', 'Pebble', 'Star'])(
    'selects %s in a static reduced-motion preview',
    async (name) => {
      setReducedMotion(true)
      const user = userEvent.setup()
      show(<SvgMorphing />)
      await user.click(screen.getByRole('button', { name }))
      expect(
        screen.getByRole('img', { name: name + ' silhouette' }),
      ).toBeVisible()
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      const shape = shapes.find((shape) => shape.name === name)!
      expect(screen.getByRole('img').querySelector('path')).toHaveAttribute(
        'd',
        shape.path,
      )
    },
  )
  it('resets shape and duration without disabling selection', async () => {
    setReducedMotion(true)
    const user = userEvent.setup()
    show(<SvgMorphing />)
    await user.click(screen.getByRole('button', { name: 'Star' }))
    fireEvent.change(screen.getByLabelText(/Duration/), {
      target: { value: '3' },
    })
    await user.click(screen.getByRole('button', { name: 'Reset shape' }))
    expect(screen.getByRole('button', { name: 'Orbit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByLabelText(/Duration/)).toHaveValue('1.6')
  })
  it('provides compatible, distinct cubic paths without invalid coordinates', () => {
    const paths = shapes.map((shape) => createShapePath(shape.name))
    expect(new Set(paths).size).toBe(4)
    for (const path of paths) {
      expect(path.match(/[MCZ]/g)).toEqual([
        'M',
        'C',
        'C',
        'C',
        'C',
        'C',
        'C',
        'C',
        'C',
        'Z',
      ])
      expect(path).not.toMatch(/NaN|Infinity/)
      expect(path.match(/-?\d+\.\d+/g)).toHaveLength(50)
    }
  })
})
describe('Interaction lab', () => {
  it('selects a card and switches the local preference', async () => {
    const user = userEvent.setup()
    show(<MicroInteractions />)
    await user.click(screen.getByRole('button', { name: /Flow/ }))
    expect(screen.getByRole('button', { name: /Flow/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('switch'))
    expect(screen.getByRole('switch')).toBeChecked()
  })
  it.each(['success', 'error'])(
    'shows loading followed by %s feedback',
    async (outcome) => {
      vi.useFakeTimers()
      try {
        show(<MicroInteractions />)
        fireEvent.change(screen.getByLabelText('Simulated outcome'), {
          target: { value: outcome },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Review and save' }))
        const dialog = screen.getByRole('dialog', { name: 'Ready to save?' })
        fireEvent.click(
          within(dialog).getByRole('button', { name: 'Confirm save' }),
        )
        expect(
          screen.getByRole('button', { name: /Saving direction/ }),
        ).toBeDisabled()
        expect(
          screen.getByRole('progressbar', { name: /Save progress/ }),
        ).toHaveValue(0)
        await act(async () => vi.advanceTimersByTime(1500))
        expect(
          screen.getByRole(outcome === 'error' ? 'alert' : 'status'),
        ).toHaveTextContent(
          outcome === 'error' ? 'Demo save failed' : 'Pulse saved',
        )
        expect(
          screen.getByRole('progressbar', { name: /Save progress/ }),
        ).toHaveValue(100)
      } finally {
        vi.useRealTimers()
      }
    },
  )
  it('cancels the modal without starting a job', async () => {
    const user = userEvent.setup()
    show(<MicroInteractions />)
    await user.click(screen.getByRole('button', { name: 'Review and save' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: /Save progress/ }),
    ).toHaveValue(0)
  })
  it('resets selection and feedback', async () => {
    const user = userEvent.setup()
    show(<MicroInteractions />)
    await user.click(screen.getByRole('button', { name: /Flow/ }))
    await user.click(screen.getByRole('switch'))
    await user.click(screen.getByRole('button', { name: 'Reset demo' }))
    expect(screen.getByRole('switch')).not.toBeChecked()
    expect(screen.getByRole('button', { name: /Pulse/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
