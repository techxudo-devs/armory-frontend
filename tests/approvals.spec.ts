import { test, expect } from '@playwright/test'
import {
  ADMIN_USER,
  API_URL,
  TEST_USER,
  apiLogin,
  createGameViaApi,
  deleteGameById,
  expectToast,
  loginViaApi,
  reserveSeatsViaApi,
} from './helpers'

test.describe('Admin seat approvals', () => {
  test('approves a pending seat reservation', async ({ page, request, playwright }) => {
    const stamp = Date.now()
    const title = `PW Approve ${stamp}`
    const reference = `PW-APPROVE-${stamp}`

    await apiLogin(request, ADMIN_USER.email, ADMIN_USER.password)
    const game = await createGameViaApi(request, {
      title,
      totalSeats: '10',
      numberOfWinners: '1',
      endType: 'manual',
    })

    const userCtx = await playwright.request.newContext({ baseURL: API_URL })
    await apiLogin(userCtx, TEST_USER.email, TEST_USER.password)
    await reserveSeatsViaApi(userCtx, game._id, [1], reference)
    await userCtx.dispose()

    try {
      await loginViaApi(page, ADMIN_USER.email, ADMIN_USER.password)
      await page.goto('/admin/approvals')

      await expect(page.getByRole('heading', { name: 'Seat Approvals' })).toBeVisible({ timeout: 15000 })

      const card = page
        .locator('div')
        .filter({ has: page.getByText(title, { exact: true }) })
        .filter({ has: page.getByRole('button', { name: 'Approve', exact: true }) })
        .last()
      await expect(card.getByText(reference)).toBeVisible({ timeout: 15000 })
      await card.getByRole('button', { name: 'Approve', exact: true }).click()

      const dialog = page
        .locator('div')
        .filter({ has: page.getByRole('heading', { name: 'Approve reservation' }) })
        .filter({ has: page.getByRole('button', { name: 'Cancel' }) })
        .last()
      await dialog.getByRole('button', { name: 'Approve', exact: true }).click()

      await expectToast(page, `Approved 1 seat for ${TEST_USER.fullName}.`)
    } finally {
      await deleteGameById(request, game._id)
    }
  })

  test('rejects a pending seat reservation', async ({ page, request, playwright }) => {
    const stamp = Date.now()
    const title = `PW Reject ${stamp}`
    const reference = `PW-REJECT-${stamp}`

    await apiLogin(request, ADMIN_USER.email, ADMIN_USER.password)
    const game = await createGameViaApi(request, {
      title,
      totalSeats: '10',
      numberOfWinners: '1',
      endType: 'manual',
    })

    const userCtx = await playwright.request.newContext({ baseURL: API_URL })
    await apiLogin(userCtx, TEST_USER.email, TEST_USER.password)
    await reserveSeatsViaApi(userCtx, game._id, [1], reference)
    await userCtx.dispose()

    try {
      await loginViaApi(page, ADMIN_USER.email, ADMIN_USER.password)
      await page.goto('/admin/approvals')

      await expect(page.getByRole('heading', { name: 'Seat Approvals' })).toBeVisible({ timeout: 15000 })

      const card = page
        .locator('div')
        .filter({ has: page.getByText(title, { exact: true }) })
        .filter({ has: page.getByRole('button', { name: 'Reject', exact: true }) })
        .last()
      await expect(card.getByText(reference)).toBeVisible({ timeout: 15000 })
      await card.getByRole('button', { name: 'Reject', exact: true }).click()

      const dialog = page
        .locator('div')
        .filter({ has: page.getByRole('heading', { name: 'Reject reservation' }) })
        .filter({ has: page.getByRole('button', { name: 'Cancel' }) })
        .last()
      await dialog.getByRole('button', { name: 'Reject', exact: true }).click()

      await expectToast(page, `Rejected 1 seat for ${TEST_USER.fullName}.`)
    } finally {
      await deleteGameById(request, game._id)
    }
  })
})
