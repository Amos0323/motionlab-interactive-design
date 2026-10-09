import { test, expect } from '@playwright/test'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const studios = [
  ['kinetic-type', 'Kinetic typography'],
  ['svg-morphing', 'SVG morphing studio'],
  ['micro-interactions', 'Micro-interactions lab'],
  ['scroll-story', 'Scroll storytelling'],
] as const
for (const [id, title] of studios) {
  for (const width of [390, 1440]) {
    test(
      title + ' navigation, reflow, console and accessibility at ' + width,
      async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.emulateMedia({ reducedMotion: 'reduce' })
        const errors: string[] = []
        page.on('pageerror', (error) => errors.push(error.message))
        page.on('console', (message) => {
          if (message.type() === 'error') errors.push(message.text())
        })
        await page.goto('/')
        const href = '/?experiment=' + id
        await page.locator('a[href="' + href + '"]').click()
        await expect(page).toHaveTitle(title + ' — MOTIONLAB')
        await expect(
          page.getByRole('heading', { level: 1, name: title }),
        ).toBeVisible()
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true)
        await page.addScriptTag({
          path: require.resolve('axe-core/axe.min.js'),
        })
        const violations = await page.evaluate(async () => {
          const axe = (window as unknown as { axe: typeof import('axe-core') })
            .axe
          return (
            await axe.run(document, {
              runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
              },
            })
          ).violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          }))
        })
        expect(violations).toEqual([])
        expect(errors).toEqual([])
        await page
          .getByRole('link', { name: '← Return to gallery', exact: true })
          .click()
        await expect(page).toHaveURL(/#experiments$/)
        await expect(page.getByRole('article')).toHaveCount(5)
      },
    )
  }
}
test('typography playback pauses, resumes, replays and respects live reduction', async ({
  page,
}) => {
  await page.goto('/?experiment=kinetic-type')
  await page.getByLabel('Animation speed').selectOption('0.5')
  await page.getByRole('button', { name: 'Split', exact: true }).click()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: 'Pause animation' }).click()
  const segment = page.locator('.type-segment').first()
  const frame = await segment.evaluate((e) => getComputedStyle(e).transform)
  await page.waitForTimeout(200)
  expect(await segment.evaluate((e) => getComputedStyle(e).transform)).toBe(
    frame,
  )
  await page.getByRole('button', { name: 'Play animation' }).click()
  await expect
    .poll(() => segment.evaluate((e) => getComputedStyle(e).transform))
    .not.toBe(frame)
  await page.getByRole('button', { name: 'Replay', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Playing')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.getByRole('status')).toContainText('Static preview')
  await expect(
    page.getByRole('button', { name: 'Replay', exact: true }),
  ).toBeDisabled()
  await expect
    .poll(() => segment.evaluate((e) => getComputedStyle(e).transform))
    .toBe('none')
})
test('SVG paths interpolate, pause globally, replay and reset', async ({
  page,
}) => {
  await page.goto('/?experiment=svg-morphing')
  await page.getByLabel(/Duration/).fill('4')
  const path = page.locator('.morph-svg path')
  const initial = await path.getAttribute('d')
  await page.getByRole('button', { name: 'Star', exact: true }).click()
  await expect.poll(() => path.getAttribute('d')).not.toBe(initial)
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click()
  const paused = await path.getAttribute('d')
  await page.waitForTimeout(200)
  expect(await path.getAttribute('d')).toBe(paused)
  await page.getByRole('button', { name: 'Resume motion', exact: true }).click()
  await expect.poll(() => path.getAttribute('d')).not.toBe(paused)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: 'Reset shape' }).click()
  await expect(path).toHaveAttribute('d', initial!)
  await expect(page.getByLabel(/Duration/)).toHaveValue('1.6')
})
test('modal traps focus, Escape restores trigger, then save completes and errors recover', async ({
  page,
}) => {
  await page.goto('/?experiment=micro-interactions')
  await page.getByRole('button', { name: /Flow/ }).click()
  await page.getByRole('switch').check()
  const trigger = page.getByRole('button', { name: 'Review and save' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Ready to save?' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
  const modalViolations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: typeof import('axe-core') }).axe
    return (await axe.run(document)).violations.map((v) => v.id)
  })
  expect(modalViolations).toEqual([])
  await page.keyboard.press('Shift+Tab')
  await expect(
    dialog.getByRole('button', { name: 'Confirm save' }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await dialog.getByRole('button', { name: 'Confirm save' }).click()
  await expect(
    page.getByRole('button', { name: /Saving direction/ }),
  ).toBeDisabled()
  await expect(page.getByRole('status')).toBeFocused()
  await expect(page.getByRole('status')).toContainText('Flow saved')
  await page.getByLabel('Simulated outcome').selectOption('error')
  await trigger.click()
  await dialog.getByRole('button', { name: 'Confirm save' }).click()
  await expect(page.getByRole('alert')).toContainText('Demo save failed')
  await expect(page.getByRole('button', { name: /Flow/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByRole('switch')).toBeChecked()
})
test('scroll story updates reading progress and stays accessible without movement', async ({
  page,
}) => {
  await page.goto('/?experiment=scroll-story')
  const progress = page.getByRole('progressbar', { name: /Reading progress/ })
  await page.getByRole('button', { name: 'Pause story motion' }).click()
  await expect(page.locator('.story-chapters')).toHaveAttribute(
    'data-story-motion',
    'off',
  )
  await page
    .getByRole('navigation', { name: 'Story chapters' })
    .getByRole('link', { name: '04 space' })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Leave room to breathe.' }),
  ).toBeInViewport()
  await expect
    .poll(async () => Number(await progress.getAttribute('value')))
    .toBeGreaterThan(70)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(
    page.getByRole('button', { name: 'Static story' }),
  ).toBeDisabled()
  for (const heading of [
    'Start with a point.',
    'Create a connection.',
    'Find the rhythm.',
    'Leave room to breathe.',
  ])
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
})

test('unknown routes provide a safe return and narrow studios do not overflow', async ({
  page,
}) => {
  await page.goto('/?experiment=constructor')
  await expect(
    page.getByRole('heading', { name: 'Study not found.' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Return to gallery' }).click()
  await expect(page).toHaveURL(/#experiments$/)
  await page.setViewportSize({ width: 320, height: 800 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [id, title] of studios) {
    await page.goto('/?experiment=' + id)
    await expect(
      page.getByRole('heading', { level: 1, name: title }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
})

test('micro-interactions honor live reduced motion while task feedback and focus still work', async ({
  page,
}) => {
  await page.goto('/?experiment=micro-interactions')
  await page.getByRole('button', { name: 'Review and save' }).click()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(
    page.getByRole('button', { name: 'Reduced motion enabled by your device' }),
  ).toBeDisabled()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Review and save' }),
  ).toBeFocused()
  await page.getByRole('button', { name: 'Review and save' }).click()
  await page.getByRole('button', { name: 'Confirm save' }).click()
  await expect(page.getByRole('status')).toBeFocused()
  await expect(page.getByRole('status')).toContainText('Pulse saved')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(
    page.getByRole('button', { name: 'Pause motion', exact: true }),
  ).toBeEnabled()
})
