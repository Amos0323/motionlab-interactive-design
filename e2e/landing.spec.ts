import { test, expect } from '@playwright/test'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

for (const width of [320, 390, 768, 1024, 1440]) {
  test('responsive content and navigation at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await page.goto('/')
    await expect(page).toHaveTitle('MOTIONLAB — Ideas in motion')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('article')).toHaveCount(5)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.getByRole('link', { name: 'Explore the experiments' }).click()
    await expect(page).toHaveURL(/#experiments$/)
    await expect(
      page.getByRole('heading', {
        name: 'Small experiments. Endless possibilities.',
      }),
    ).toBeInViewport()
    await page.getByRole('link', { name: 'Back to top' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
    expect(errors).toEqual([])
  })
}

test('keyboard skip link, visible focus, native disclosure and pause control', async ({
  page,
}) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  const summary = page
    .getByRole('article', { name: 'Kinetic type' })
    .locator('summary')
  await summary.focus()
  expect(await summary.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe(
    'solid',
  )
  await page.keyboard.press('Enter')
  await expect(summary.locator('..')).toHaveAttribute('open', '')
  await expect(page.getByText(/A study in rhythm/)).toBeVisible()
  await page.keyboard.press('Space')
  await expect(summary.locator('..')).not.toHaveAttribute('open')
  const pause = page.locator('.motion-toggle')
  await pause.focus()
  await page.keyboard.press('Space')
  await expect(pause).toHaveText('▷Resume motion')
  const orbit = page.locator('.hero-art .orbit-spin')
  expect(
    await orbit.evaluate((e) => getComputedStyle(e).animationPlayState),
  ).toBe('paused')
  // Wait for the browser compositor to commit the paused animation frame.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  )
  const transform = await orbit.evaluate((e) => getComputedStyle(e).transform)
  await page.waitForTimeout(150)
  expect(await orbit.evaluate((e) => getComputedStyle(e).transform)).toBe(
    transform,
  )
  await page.keyboard.press('Space')
  await expect(pause).toHaveText('ⅡPause motion')
  expect(
    await orbit.evaluate((e) => getComputedStyle(e).animationPlayState),
  ).toBe('running')
})

test('live reduced-motion preference disables all decorative loops', async ({
  page,
}) => {
  await page.goto('/')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(
    page.getByRole('button', { name: 'Reduced motion enabled by your device' }),
  ).toBeDisabled()
  expect(
    await page
      .locator('.hero-art .orbit-spin')
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe('none')
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe('auto')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.getByRole('button', { name: 'Pause motion' })).toBeEnabled()
})

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(
    'automated accessibility with expanded briefs and ' + reducedMotion,
    async ({ page }) => {
      await page.emulateMedia({ reducedMotion })
      await page.goto('/')
      for (const summary of await page.locator('summary').all())
        await summary.click()
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
      const violations = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: typeof import('axe-core') })
          .axe
        const result = await axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
          },
        })
        return result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        }))
      })
      expect(violations).toEqual([])
    },
  )
}
