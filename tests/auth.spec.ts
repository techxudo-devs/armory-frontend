import { test, expect } from '@playwright/test'
import { ADMIN_USER, TEST_USER, expectToast, loginViaUI, signOut } from './helpers'

test.describe('Authentication', () => {
  test('registers a new user account and lands on the user dashboard', async ({ page }) => {
    const stamp = Date.now()
    const fullName = 'PW Register Test'
    const email = `pwregister.${stamp}@test.com`
    const phone = `09${stamp.toString().slice(-8)}`
    const password = 'TestPass123!'

    await page.goto('/register')
    await page.getByLabel('Full name').fill(fullName)
    await page.getByLabel('Phone').fill(phone)
    await page.getByLabel('Email').fill(email)
    await page.locator('input[name="password"]').fill(password)
    await page.locator('input[name="terms"]').check()
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    await expectToast(page, 'Account created successfully!')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('logs in a regular user and is redirected to /dashboard', async ({ page }) => {
    await loginViaUI(page, TEST_USER.email, TEST_USER.password)

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    await expectToast(page, 'Logged in successfully!')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('logs in as admin and is redirected to /admin', async ({ page }) => {
    await loginViaUI(page, ADMIN_USER.email, ADMIN_USER.password)

    await expect(page).toHaveURL(/\/admin$/, { timeout: 15000 })
    await expectToast(page, 'Logged in successfully!')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('shows an error toast for invalid credentials and stays on login', async ({ page }) => {
    await loginViaUI(page, TEST_USER.email, 'DefinitelyWrong!')

    await expectToast(page, 'Invalid credentials.')
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows validation toast when submitting an empty forgot-password form', async ({ page }) => {
    await page.goto('/forgot-password', { waitUntil: 'networkidle' })
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible()

    await page.getByRole('button', { name: 'Send reset link' }).click()

    await expectToast(page, 'Please enter your email address.')
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test('sends a password reset link for an existing email', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByLabel('Email').fill(ADMIN_USER.email)
    await page.getByRole('button', { name: 'Send reset link' }).click()

    await expectToast(page, 'Password reset link sent to your email.')
    await expect(page).toHaveURL(/\/login/)
  })

  test('signs out from the dashboard and returns to login', async ({ page }) => {
    await loginViaUI(page, TEST_USER.email, TEST_USER.password)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

    await signOut(page)
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })
})
