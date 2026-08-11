import { expect, type Page, type APIRequestContext } from '@playwright/test'

export const API_URL = 'http://localhost:5000/api'

export const TEST_USER = {
  fullName: 'Test Player',
  email: 'testplayer@luckyseat.com',
  phone: '09990000001',
  password: 'TestPass123!',
}

export const ADMIN_USER = {
  fullName: 'Super Admin',
  email: 'admin@luckyseat.com',
  phone: '1234567890',
  password: 'AdminPass123!',
}

/** A game known to exist in the dev DB with free seats. */
export const ACTIVE_GAME_CODE = 'D6508095'

export interface SeatMapEntry {
  seatNumber: number
  isReserved: boolean
  isMine: boolean
  status?: string
}

export interface GameInfo {
  _id: string
  title: string
  prize: string
  status: string
  gameCode: string
  numberOfWinners?: number
}

/** Log in through the API so the auth cookie lands in the browser context. */
export async function loginViaApi(page: Page, identifier: string, password: string) {
  const res = await page.request.post(`${API_URL}/auth/login`, {
    data: { identifier, password },
  })
  expect(res.ok(), `API login for ${identifier} should succeed`).toBeTruthy()
}

/** Log in via the API on a standalone request context (setup / beforeAll). */
export async function apiLogin(request: APIRequestContext, identifier: string, password: string) {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { identifier, password },
  })
  expect(res.ok(), `API login for ${identifier} should succeed`).toBeTruthy()
}

/** Full UI login flow used by the auth spec. */
export async function loginViaUI(page: Page, identifier: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email or phone').fill(identifier)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: 'Log in' }).click()
}

/** Make sure the deterministic test user exists (self-healing across DB resets). */
export async function ensureTestUser(request: APIRequestContext) {
  const login = await request.post(`${API_URL}/auth/login`, {
    data: { identifier: TEST_USER.email, password: TEST_USER.password },
  })
  if (login.ok()) return
  const reg = await request.post(`${API_URL}/auth/register`, {
    data: {
      fullName: TEST_USER.fullName,
      email: TEST_USER.email,
      phone: TEST_USER.phone,
      password: TEST_USER.password,
    },
  })
  expect(reg.ok(), 'registering the test user should succeed').toBeTruthy()
}

export async function expectToast(page: Page, message: string | RegExp) {
  await expect(page.getByText(message).first()).toBeVisible({ timeout: 10000 })
}

/** Sign out from the dashboard (works on desktop and mobile). */
export async function signOut(page: Page) {
  // The dashboard shows a loading spinner (no header yet) right after navigation,
  // so a one-shot isVisible() check on "Open menu" can race it and be skipped.
  // Key off the viewport width (matches the layout's `md:` breakpoint) instead,
  // and let click() auto-wait for the button to actually render.
  const isMobile = (page.viewportSize()?.width ?? 1280) < 768
  if (isMobile) {
    await page.getByTitle('Open menu').click()
  }
  const btn = page.locator('button[title="Sign Out"]').filter({ visible: true })
  await btn.scrollIntoViewIfNeeded()
  await btn.click()
}

/** Fetch a game by code through the public API. */
export async function fetchGameByCode(
  client: APIRequestContext,
  gameCode: string,
): Promise<GameInfo> {
  const res = await client.get(`${API_URL}/games/code/${gameCode}`)
  expect(res.ok(), `GET /games/code/${gameCode} should succeed`).toBeTruthy()
  const body = await res.json()
  const game = body?.data?.game
  expect(game, 'game should be returned').toBeTruthy()
  return game as GameInfo
}

/** Fetch free seat numbers for a game via the public API. */
export async function fetchAvailableSeatNumbers(
  client: APIRequestContext,
  gameCode: string,
  limit = 3,
): Promise<number[]> {
  const res = await client.get(`${API_URL}/games/code/${gameCode}`)
  expect(res.ok(), `GET /games/code/${gameCode} should succeed`).toBeTruthy()
  const body = await res.json()
  const seatMap: SeatMapEntry[] = body?.data?.seatMap ?? []
  return seatMap
    .filter((s) => !s.isReserved)
    .map((s) => s.seatNumber)
    .slice(0, limit)
}

/** Create a dedicated game as admin (returns the created game). */
export async function createGameViaApi(
  request: APIRequestContext,
  data: {
    title: string
    prize?: string
    description?: string
    totalSeats?: string
    numberOfWinners?: string
    endType?: string
  },
): Promise<GameInfo> {
  const res = await request.post(`${API_URL}/admin/games`, {
    multipart: {
      title: data.title,
      prize: data.prize ?? 'Test Prize',
      description: data.description ?? 'Created by Playwright tests',
      totalSeats: data.totalSeats ?? '10',
      numberOfWinners: data.numberOfWinners ?? '1',
      endType: data.endType ?? 'manual',
    },
  })
  expect(res.ok(), 'create game via API should succeed').toBeTruthy()
  const body = await res.json()
  const game = body?.data?.game ?? body?.data
  expect(game, 'created game should be returned').toBeTruthy()
  return game as GameInfo
}

/** Delete a game (and all its seats) via the admin API. */
export async function deleteGameById(request: APIRequestContext, gameId: string) {
  try {
    const res = await request.delete(`${API_URL}/admin/games/${gameId}`)
    expect(res.ok(), 'delete game via API should succeed').toBeTruthy()
  } catch (error) {
    if (error instanceof Error && /closed|disposed/i.test(error.message)) return
    throw error
  }
}

/** Force-end a game via the admin API so winners can be selected. */
export async function endGameViaApi(request: APIRequestContext, gameId: string) {
  const res = await request.patch(`${API_URL}/admin/games/${gameId}/end`)
  expect(res.ok(), 'end game via API should succeed').toBeTruthy()
}

/** Register a brand-new user via the API and return the created user. */
export async function createUserViaApi(
  request: APIRequestContext,
  data: { fullName: string; email: string; phone: string; password: string },
): Promise<{ _id: string; fullName: string; email: string }> {
  const res = await request.post(`${API_URL}/auth/register`, { data })
  expect(res.ok(), 'registering user via API should succeed').toBeTruthy()
  const body = await res.json()
  const user = body?.data?.user ?? body?.data
  expect(user, 'registered user should be returned').toBeTruthy()
  return user
}

/** Find an admin game by its exact title (newest-first list). */
export async function findGameByTitle(
  client: APIRequestContext,
  title: string,
): Promise<GameInfo | null> {
  const res = await client.get(`${API_URL}/admin/games?page=1&limit=100`)
  expect(res.ok(), 'GET /admin/games should succeed').toBeTruthy()
  const body = await res.json()
  const items: GameInfo[] = body?.data ?? []
  return items.find((g) => g.title === title) ?? null
}

export interface PendingSeatGroup {
  gameId: string
  userId: string
  user: { fullName: string; phone?: string; email?: string }
  game: { title: string; gameCode: string; prize: string }
  seatNumbers: number[]
  seats: { seatId: string; seatNumber: number; paymentReference: string }[]
  total: number
}

/** Fetch pending seat approval groups (admin auth required). */
export async function fetchPendingApprovals(
  client: APIRequestContext,
): Promise<PendingSeatGroup[]> {
  const res = await client.get(`${API_URL}/admin/pending-approvals`)
  expect(res.ok(), 'GET /admin/pending-approvals should succeed').toBeTruthy()
  const body = await res.json()
  return body?.data ?? []
}

/** Reserve seats via the API (creates a pending approval for the current user). */
export async function reserveSeatsViaApi(
  request: APIRequestContext,
  gameId: string,
  seatNumbers: number[],
  paymentReference: string,
) {
  const res = await request.post(`${API_URL}/seats/${gameId}/reserve`, {
    data: { seatNumbers, paymentReference },
  })
  expect(res.ok(), 'reserve via API should succeed').toBeTruthy()
  return res.json()
}

/** Check whether the current user already has a seat in the given game. */
export async function isUserInGame(
  request: APIRequestContext,
  gameId: string,
): Promise<boolean> {
  const res = await request.get(`${API_URL}/seats/my-games?page=1&limit=100`)
  expect(res.ok(), 'GET /seats/my-games should succeed').toBeTruthy()
  const body = await res.json()
  const items: { gameId: string }[] = body?.data ?? []
  return items.some((g) => g.gameId === gameId)
}
