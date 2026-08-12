import { test, expect } from '@playwright/test'
import {
  ADMIN_USER,
  TEST_USER,
  apiLogin,
  createGameViaApi,
  deleteGameById,
  expectToast,
  loginViaApi,
} from './helpers'

test.describe('User dashboard', () => {
  test('shows stats, quick actions and featured games', async ({ page }) => {
    await loginViaApi(page, TEST_USER.email, TEST_USER.password)
    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 15000 })
    const main = page.locator('main')
    await expect(main.getByText('Welcome back, Test!')).toBeVisible()
    await expect(main.getByText('Active Games', { exact: true }).first()).toBeVisible()
    await expect(main.getByText('My Games', { exact: true }).first()).toBeVisible()
    await expect(main.getByText('Total Wins', { exact: true }).first()).toBeVisible()
    await expect(main.getByText('Total Loses', { exact: true }).first()).toBeVisible()
    await expect(main.getByRole('heading', { name: 'Quick Actions' })).toBeVisible()
    await expect(main.getByRole('link', { name: 'My Seats' })).toBeVisible()
    await expect(main.getByRole('heading', { name: 'Featured Games' })).toBeVisible()
    await expect(main.getByRole('link', { name: 'View all', exact: true })).toBeVisible()
  })

  test('active games page shows available games', async ({ page }) => {
    await loginViaApi(page, TEST_USER.email, TEST_USER.password)
    await page.goto('/dashboard/active-games')

    await expect(page.getByRole('heading', { name: 'Active Games' })).toBeVisible({ timeout: 15000 })
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: 'Available Games' })).toBeVisible()

    const gameAction = main.getByRole('button', { name: /Join Game|Participated/ }).first()
    const emptyState = main.getByText('No active games right now')
    await expect(gameAction.or(emptyState)).toBeVisible({ timeout: 15000 })
  })

  test('my seats page shows summary, reserved seats and game history', async ({ page }) => {
    await loginViaApi(page, TEST_USER.email, TEST_USER.password)
    await page.goto('/dashboard/my-seats')

    await expect(page.getByRole('heading', { name: 'My Seats' })).toBeVisible({ timeout: 15000 })
    const main = page.locator('main')
    await expect(main.getByText('Games Played', { exact: true })).toBeVisible()
    await expect(main.getByText('Total Wins', { exact: true })).toBeVisible()
    await expect(main.getByText('Total Loses', { exact: true })).toBeVisible()
    await expect(main.getByRole('heading', { name: 'Reserved Seats' })).toBeVisible()
    await expect(main.getByRole('heading', { name: 'Game History' })).toBeVisible()
  })

  test('notifications page renders the list or empty state', async ({ page }) => {
    await loginViaApi(page, TEST_USER.email, TEST_USER.password)
    await page.goto('/dashboard/notifications')

    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible({ timeout: 15000 })
    const main = page.locator('main')
    const emptyState = main.getByText('No notifications yet')
    const markAll = main.getByRole('button', { name: 'Mark all read' })
    await expect(emptyState.or(markAll)).toBeVisible({ timeout: 15000 })
  })

  test('my profile shows the user details and the edit flow', async ({ page }) => {
    await loginViaApi(page, TEST_USER.email, TEST_USER.password)
    await page.goto('/dashboard/my-profile')

    await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible({ timeout: 15000 })
    const main = page.locator('main')
    await expect(main.getByText(TEST_USER.fullName, { exact: true })).toBeVisible()
    await expect(main.getByText(TEST_USER.email, { exact: true })).toBeVisible()
    await expect(main.getByText('Player', { exact: true })).toBeVisible()
    await expect(main.getByRole('heading', { name: 'Personal Information' })).toBeVisible()

    await main.getByRole('button', { name: 'Edit' }).click()
    await expect(main.getByRole('button', { name: 'Save Changes' })).toBeVisible()
    await main.getByRole('button', { name: 'Save Changes' }).click()
    await expectToast(page, 'Profile updates will be available soon')
  })

  test('reserves a seat through the payment flow', async ({ page, request }) => {
    await apiLogin(request, ADMIN_USER.email, ADMIN_USER.password)
    const stamp = Date.now()
    const game = await createGameViaApi(request, {
      title: `PW Seat Flow ${stamp}`,
      totalSeats: '10',
      numberOfWinners: '1',
      endType: 'manual',
    })

    try {
      await loginViaApi(page, TEST_USER.email, TEST_USER.password)
      await page.goto(`/dashboard/games/${game.gameCode}`)

      await expect(page.getByRole('heading', { name: game.title })).toBeVisible({ timeout: 15000 })
      await expect(page.getByRole('heading', { name: 'Choose Your Seats' })).toBeVisible()

      await page.getByRole('button', { name: '1', exact: true }).click()
      await page.getByRole('button', { name: 'Reserve 1 Seat' }).click()

      await expect(page.getByRole('heading', { name: 'Pay Here' })).toBeVisible()
      await page.locator('#payment-reference').fill(`PW-UI-${stamp}`)
      await page.getByRole('button', { name: 'Pay & Submit' }).click()

      await expectToast(page, /Seat #1 submitted\. They are now pending admin approval\./)
      await expect(page.getByText('1 seat awaiting approval: #1', { exact: true })).toBeVisible({
        timeout: 15000,
      })
    } finally {
      await deleteGameById(request, game._id)
    }
  })
})
