import { test, expect, type Page } from '@playwright/test'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const route = '/?experiment=third-dimension'
async function openViewer(page: Page) {
  await page.goto(route)
  await page.locator('.product-stage').scrollIntoViewIfNeeded()
  await expect(page.getByText('Real-time 3D', { exact: true })).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()
  await page.waitForTimeout(1200)
}
async function axe(page: Page) {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
  const violations = await page.evaluate(async () => {
    const result = await (
      window as unknown as { axe: typeof import('axe-core') }
    ).axe.run(document, {
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
}
for (const width of [320, 390, 768, 1440]) {
  test(`3D product renders and remains accessible at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (e) => {
      if (e.type() === 'error') errors.push(e.text())
    })
    await openViewer(page)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    expect(
      await page
        .locator('canvas')
        .evaluate(
          (e: HTMLCanvasElement) => e.width / e.getBoundingClientRect().width,
        ),
    ).toBeLessThanOrEqual(1.51)
    await axe(page)
    await page.getByRole('button', { name: 'Chalk', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Chalk')
    expect(errors).toEqual([])
  })
}
test('materials, exploded geometry, camera reset and drag change the rendered product', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openViewer(page)
  const canvas = page.locator('canvas')
  const original = await canvas.screenshot()
  await page.getByRole('button', { name: 'Glacier', exact: true }).click()
  expect((await canvas.screenshot()).equals(original)).toBe(false)
  const assembled = await canvas.screenshot()
  await page.getByRole('button', { name: 'Exploded view' }).click()
  expect((await canvas.screenshot()).equals(assembled)).toBe(false)
  await page.getByRole('button', { name: 'Exploded view' }).click()
  await expect
    .poll(async () => (await canvas.screenshot()).equals(assembled))
    .toBe(true)
  await page.getByRole('button', { name: 'Rotate left' }).focus()
  await page.keyboard.press('Enter')
  expect((await canvas.screenshot()).equals(assembled)).toBe(false)
  await page.getByRole('button', { name: 'Reset camera' }).click()
  await expect
    .poll(async () => (await canvas.screenshot()).equals(assembled))
    .toBe(true)
  const bounds = await canvas.boundingBox()
  if (!bounds) throw new Error('Missing canvas')
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    bounds.x + bounds.width / 2 + 80,
    bounds.y + bounds.height / 2,
    { steps: 10 },
  )
  await page.mouse.up()
  expect((await canvas.screenshot()).equals(assembled)).toBe(false)
  expect(await canvas.evaluate((e) => getComputedStyle(e).touchAction)).toBe(
    'pan-y',
  )
  const before = await page.evaluate(() => scrollY)
  await page.mouse.wheel(0, 150)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before)
})
test('automatic rotation stops for global pause and live reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1100 })
  await openViewer(page)
  const canvas = page.locator('canvas')
  await page.getByRole('button', { name: 'Automatic rotation' }).click()
  const moving = await canvas.screenshot()
  await page.waitForTimeout(250)
  expect((await canvas.screenshot()).equals(moving)).toBe(false)
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click()
  await canvas.scrollIntoViewIfNeeded()
  await page.waitForTimeout(150)
  const paused = await canvas.screenshot()
  await page.waitForTimeout(200)
  expect((await canvas.screenshot()).equals(paused)).toBe(true)
  await page.getByRole('button', { name: 'Resume motion', exact: true }).click()
  await canvas.scrollIntoViewIfNeeded()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(
    page.getByRole('button', { name: 'Automatic rotation' }),
  ).toBeDisabled()
  await page.waitForTimeout(150)
  const reduced = await canvas.screenshot()
  await page.waitForTimeout(200)
  expect((await canvas.screenshot()).equals(reduced)).toBe(true)
})
test('unsupported WebGL keeps product choices and illustration usable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith('webgl')) return null
      return original.apply(this, args)
    } as typeof original
  })
  await page.goto(route)
  await expect(
    page.getByRole('img', { name: /static illustration/ }),
  ).toBeVisible()
  await expect(page.getByRole('status')).toContainText('3D is unavailable')
  await page.getByRole('button', { name: 'Chalk', exact: true }).click()
  await expect(page.getByRole('img', { name: /Chalk/ })).toBeVisible()
  await axe(page)
})
test('context loss falls back without losing product state', async ({
  page,
}) => {
  await openViewer(page)
  await page.getByRole('button', { name: 'Glacier', exact: true }).click()
  await page
    .locator('canvas')
    .evaluate((canvas: HTMLCanvasElement) =>
      canvas
        .getContext('webgl2')
        ?.getExtension('WEBGL_lose_context')
        ?.loseContext(),
    )
  await expect(
    page.getByRole('img', { name: /Glacier.*static illustration/ }),
  ).toBeVisible()
  await expect(page.getByRole('status')).toContainText('3D is unavailable')
  await expect(page.locator('canvas')).toHaveCount(0)
})
test('static view unmounts the renderer and can return to working 3D', async ({
  page,
}) => {
  await openViewer(page)
  await page.getByRole('button', { name: 'Static illustration' }).click()
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(
    page.getByRole('img', { name: /static illustration/ }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Static illustration' }).click()
  await expect(page.getByText('Real-time 3D', { exact: true })).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()
})

test('offscreen rendering pauses and GPU buffers are released on unmount', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const metrics = { draws: 0, released: 0, shadowDraws: 0 }
    let shadowTarget = false
    const bind = WebGL2RenderingContext.prototype.bindFramebuffer
    WebGL2RenderingContext.prototype.bindFramebuffer = function (
      target,
      framebuffer,
    ) {
      if (target === this.FRAMEBUFFER || target === this.DRAW_FRAMEBUFFER)
        shadowTarget = framebuffer !== null
      return bind.call(this, target, framebuffer)
    }
    Object.assign(window, { gpuMetrics: metrics })
    const draw = WebGL2RenderingContext.prototype.drawElements
    WebGL2RenderingContext.prototype.drawElements = function (
      ...args: Parameters<typeof draw>
    ) {
      metrics.draws++
      if (shadowTarget) metrics.shadowDraws++
      return draw.apply(this, args)
    }
    const release = WebGL2RenderingContext.prototype.deleteBuffer
    WebGL2RenderingContext.prototype.deleteBuffer = function (
      ...args: Parameters<typeof release>
    ) {
      metrics.released++
      return release.apply(this, args)
    }
  })
  await page.setViewportSize({ width: 1440, height: 600 })
  await openViewer(page)
  await page.getByRole('button', { name: 'Automatic rotation' }).click()
  await page.locator('canvas').scrollIntoViewIfNeeded()
  const metrics = () =>
    page.evaluate(
      () =>
        (
          window as unknown as {
            gpuMetrics: { draws: number; released: number; shadowDraws: number }
          }
        ).gpuMetrics,
    )
  const start = (await metrics()).draws
  await expect.poll(async () => (await metrics()).draws).toBeGreaterThan(start)
  const cachedShadows = (await metrics()).shadowDraws
  await page.waitForTimeout(200)
  expect((await metrics()).shadowDraws).toBe(cachedShadows)
  // The page uses smooth scrolling; finish the move before measuring offscreen work.
  await page.evaluate(() => scrollTo({ top: 0, left: 0, behavior: 'instant' }))
  await expect(page.locator('canvas')).not.toBeInViewport()
  await page.waitForTimeout(250)
  const stopped = (await metrics()).draws
  await page.waitForTimeout(250)
  expect((await metrics()).draws).toBe(stopped)
  await page.locator('canvas').scrollIntoViewIfNeeded()
  await expect
    .poll(async () => (await metrics()).draws)
    .toBeGreaterThan(stopped)
  const beforeRelease = (await metrics()).released
  await page.getByRole('button', { name: 'Static illustration' }).click()
  await expect
    .poll(async () => (await metrics()).released)
    .toBeGreaterThan(beforeRelease)
  await expect(page.locator('canvas')).toHaveCount(0)
})
