import { test, expect } from '@playwright/test'
import {
  ADMIN_USER,
  apiLogin,
  createGameViaApi,
  createUserViaApi,
  deleteGameById,
  expectToast,
  findGameByTitle,
  loginViaApi,
} from './helpers'

test.describe('Admin dashboard', () => {
  test('shows stats and the quick create link', async ({ page }) => {
    await loginViaApi(page, ADMIN_USER.email, ADMIN_USER.password)
    await page.goto('/admin')

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15000 })
    const main = page.locator('main')
    await expect(main.getByText('Total Games', { exact: true })).toBeVisible()
    await expect(main.getByText('Active Users', { exact: true })).toBeVisible()
    await expect(
      main.getByRole('paragraph').filter({ hasText: 'Seats Reserved' }),
    ).toBeVisible()
    await expect(main.getByText('Completed Games', { exact: true })).toBeVisible()
    await expect(main.getByRole('link', { name: 'Create Game' })).toBeVisible()
  })

  test('searches games on the manage games page', async ({ page, request }) => {
    await apiLogin(request, ADMIN_USER.email, ADMIN_USER.password)
    const stamp = Date.now()
    const title = `PW Search ${stamp}`
    const game = await createGameViaApi(request, {
      title,
      totalSeats: '10',
      endType: 'manual',
    })

    try {
      await loginViaApi(page, ADMIN_USER.email, ADMIN_USER.password)
      await page.goto('/admin/manage-games')

      await expect(page.getByRole('heading', { name: 'Manage Games' })).toBeVisible({ timeout: 15000 })
      const search = page.getByPlaceholder('Search by title or game code...')
      await search.fill(title)
      await expect(page.getByText(title, { exact: true })).toBeVisible({ timeout: 10000 })

      await search.fill('zzzz-no-such-game')
      await expect(page.getByText('No games found. Try adjusting your filters.')).toBeVisible({
        timeout: 10000,
      })
    } finally {
      await deleteGameById(request, game._id)
    }
  })

  test('creates a game through the create-game page', async ({ page, request }) => {
    await apiLogin(request, ADMIN_USER.email, ADMIN_USER.password)
    const stamp = Date.now()
    const title = `PW UI Create ${stamp}`

    await loginViaApi(page, ADMIN_USER.email, ADMIN_USER.password)
    await page.goto('/admin/create-game')

    await expect(page.getByRole('heading', { name: 'Create New Game' })).toBeVisible({ timeout: 15000 })
    await page.locator('#title').fill(title)
    await page.locator('#prize').fill('Playwright Prize')
    await page.locator('#description').fill('Created by the create-game UI test')
    await page.locator('#totalSeats').fill('8')
    await page.locator('#numberOfWinners').fill('1')
    await page.locator('#endType').selectOption('manual')
    await page.getByRole('button', { name: 'Create Game' }).click()

    await expect(page).toHaveURL(/\/admin\/manage-games/, { timeout: 15000 })
    await expectToast(page, 'Game created successfully!')
    await expect(page.getByText(title, { exact: true })).toBeVisible({ timeout: 15000 })

    const created = await findGameByTitle(request, title)
    expect(created, 'created game should be findable via the admin API').toBeTruthy()
    if (created) await deleteGameById(request, created._id)
  })

  test('blocks and unblocks a user', async ({ page, request }) => {
    await apiLogin(request, ADMIN_USER.email, ADMIN_USER.password)
    const stamp = Date.now()
    const user = await createUserViaApi(request, {
      fullName: `PW Block ${stamp}`,
      email: `pwblock.${stamp}@test.com`,
      phone: `09${stamp.toString().slice(-8)}`,
      password: 'TestPass123!',
    })

    await loginViaApi(page, ADMIN_USER.email, ADMIN_USER.password)
    await page.goto('/admin/manage-users')

    await expect(page.getByRole('heading', { name: 'Manage Users' })).toBeVisible({ timeout: 15000 })
    const search = page.getByPlaceholder('Search by name, email or phone...')
    await search.fill(user.email)

    const row = page.locator('tr').filter({ hasText: user.email })
    await expect(row).toBeVisible({ timeout: 10000 })

    await row.getByRole('button', { name: 'Block', exact: true }).click()
    await expectToast(page, `${user.fullName} has been blocked.`)
    await expect(row.getByText('Blocked', { exact: true })).toBeVisible({ timeout: 10000 })
    await expect(row.getByRole('button', { name: 'Unblock', exact: true })).toBeVisible()

    await row.getByRole('button', { name: 'Unblock', exact: true }).click()
    await expectToast(page, `${user.fullName} has been unblocked.`)
    await expect(row.getByText('Active', { exact: true })).toBeVisible({ timeout: 10000 })
  })

  test('ended games page lists ended games and opens participants', async ({ page }) => {
    await loginViaApi(page, ADMIN_USER.email, ADMIN_USER.password)
    await page.goto('/admin/ended-games')

    await expect(page.getByRole('heading', { name: 'Ended Games' })).toBeVisible({ timeout: 15000 })
    const main = page.locator('main')
    const announceBtn = main.getByRole('button', { name: 'View Participants & Announce Winners' })
    const emptyState = main.getByText('No ended games found')
    await expect(announceBtn.first().or(emptyState)).toBeVisible({ timeout: 15000 })

    if (await announceBtn.first().isVisible().catch(() => false)) {
      await announceBtn.first().click()
      await expect(page.getByRole('heading', { name: 'Participants' })).toBeVisible()
      await page.getByRole('button', { name: 'Close', exact: true }).click()
    }
  })

  test('game history page renders the winners list', async ({ page }) => {
    await loginViaApi(page, ADMIN_USER.email, ADMIN_USER.password)
    await page.goto('/admin/game-history')

    await expect(page.getByRole('heading', { name: 'Game History' })).toBeVisible({ timeout: 15000 })
    const main = page.locator('main')
    await expect(main.getByText('Total Winners', { exact: true })).toBeVisible()
    const emptyState = main.getByText('No winners found.')
    const anyRow = main.locator('table tbody tr').first()
    await expect(emptyState.or(anyRow)).toBeVisible({ timeout: 15000 })
  })
})
