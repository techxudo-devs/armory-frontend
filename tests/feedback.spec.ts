import { test, expect, request as pwRequest } from '@playwright/test'
import {
  ADMIN_USER,
  TEST_USER,
  API_URL,
  apiLogin,
  expectToast,
  loginViaApi,
} from './helpers'

test.describe('Feedback / Support', () => {
  test('user can submit feedback from the dashboard and sees it in My submissions', async ({ page }) => {
    await loginViaApi(page, TEST_USER.email, TEST_USER.password)
    await page.goto('/dashboard/feedback')

    await expect(page.getByRole('heading', { name: 'Feedback & Support' })).toBeVisible({ timeout: 15000 })
    const main = page.locator('main')
    await expect(main.getByText('Send a message')).toBeVisible()

    const stamp = Date.now()
    const subject = `PW Feedback ${stamp}`
    await main.getByRole('button', { name: 'Good Word' }).click()
    await main.locator('#feedback-subject').fill(subject)
    await main.locator('#feedback-message').fill('Great platform, keep it up!')

    await main.getByRole('button', { name: 'Submit Feedback' }).click()
    await expectToast(page, /Feedback submitted/)
    await expect(main.getByText(subject, { exact: true })).toBeVisible({ timeout: 15000 })
  })

  test('admin receives the feedback and can resolve it', async () => {
    const userCtx = await pwRequest.newContext({ baseURL: 'http://localhost:3000' })
    await apiLogin(userCtx, TEST_USER.email, TEST_USER.password)

    const stamp = Date.now()
    const subject = `PW Admin Inbox ${stamp}`
    const create = await userCtx.post(`${API_URL}/feedback`, {
      data: { type: 'complaint', subject, message: 'Admin inbox check via API' },
    })
    expect(create.ok(), 'submitting feedback via API should succeed').toBeTruthy()
    const created = (await create.json())?.data
    expect(created?._id, 'created feedback should return an id').toBeTruthy()

    try {
      const adminCtx = await pwRequest.newContext({ baseURL: 'http://localhost:3000' })
      await apiLogin(adminCtx, ADMIN_USER.email, ADMIN_USER.password)

      const list = await adminCtx.get(`${API_URL}/feedback?page=1&limit=100`)
      expect(list.ok(), 'GET /feedback as admin should succeed').toBeTruthy()
      const items = (await list.json())?.data ?? []
      expect(
        items.some((f: { subject: string }) => f.subject === subject),
        'admin should see the submitted feedback',
      ).toBeTruthy()

      const counts = await adminCtx.get(`${API_URL}/feedback/counts`)
      expect(counts.ok(), 'GET /feedback/counts should succeed').toBeTruthy()

      const resolve = await adminCtx.patch(`${API_URL}/feedback/${created._id}/status`, {
        data: { status: 'resolved' },
      })
      expect(resolve.ok(), 'resolving feedback should succeed').toBeTruthy()

      await adminCtx.dispose()
    } finally {
      await userCtx.dispose()
    }
  })

  test('sidebar shows Feedback tab for user', async ({ page }) => {
    await loginViaApi(page, TEST_USER.email, TEST_USER.password)
    await page.goto('/dashboard')
    await expect(page.getByRole('link', { name: 'Feedback', exact: true })).toBeVisible({ timeout: 15000 })
  })

  test('admin sidebar shows Feedback Inbox and the page renders', async ({ page }) => {
    await loginViaApi(page, ADMIN_USER.email, ADMIN_USER.password)
    await page.goto('/admin/feedback')

    await expect(page.getByRole('heading', { name: 'Feedback Inbox' })).toBeVisible({ timeout: 15000 })
    const main = page.locator('main')
    await expect(main.getByRole('button', { name: /New/ })).toBeVisible()
    await expect(main.getByRole('button', { name: /All/ })).toBeVisible()
  })
})
