import { test, expect } from '@playwright/test'
import { ACTIVE_GAME_CODE } from './helpers'

test.describe('Public landing page', () => {
  test('renders header, hero and raffle sections', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('IGY6ARMORY')).toBeVisible()
    // Nav links are intentionally hidden below the md breakpoint (mobile project).
    if (!test.info().project.name.toLowerCase().includes('mobile')) {
      const nav = page.getByRole('navigation')
      await expect(nav.getByRole('link', { name: 'Live raffles' })).toBeVisible()
      await expect(nav.getByRole('link', { name: 'How it works' })).toBeVisible()
      await expect(nav.getByRole('link', { name: 'Categories' })).toBeVisible()
      await expect(nav.getByRole('link', { name: 'FAQ' })).toBeVisible()
    }

    await expect(page.getByRole('heading', { name: /Premium gear armony/ })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Browse live raffles' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /All raffles, Grab your seat/ })).toBeVisible()
    await expect(page.getByRole('link', { name: 'View all 38 raffles' })).toBeVisible()
  })

  test('navigates from the header to the login page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Log in' }).click()
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Log in to your account' })).toBeVisible()
  })

  test('renders a public game page with its seat grid', async ({ page }) => {
    await page.goto(`/game/${ACTIVE_GAME_CODE}`)

    await expect(page.getByRole('heading', { name: 'Pubg Mobile - APEX SHOWDOWN' })).toBeVisible(
      { timeout: 15000 },
    )
    await expect(page.getByText('Open for entries')).toBeVisible()
    await expect(page.getByText('Available', { exact: true })).toBeVisible()
    await expect(page.getByText('Reserved', { exact: true })).toBeVisible()

    const seatButtons = page.getByRole('button', { name: /^\d+$/ })
    await expect(seatButtons.first()).toBeVisible()
    expect(await seatButtons.count()).toBeGreaterThan(0)
  })
})
