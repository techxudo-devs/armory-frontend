import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'

const envText = readFileSync(
  '/home/muhammad-annas-khan/office-work/full-stack-apps/armory-app/armory-backend/.env',
  'utf8',
)
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/\s+#.*$/, '').trim()
}

const title = `PW Instant Game ${Date.now()}`

const browser = await chromium.launch()

// USER: open dashboard first
const uc = await browser.newContext()
await uc.request.post('http://localhost:5000/api/auth/login', {
  data: { identifier: 'testplayer@luckyseat.com', password: 'TestPass123!' },
})
const up = await uc.newPage()
const ue = []
up.on('console', (m) => m.type() === 'error' && ue.push(m.text()))
up.on('pageerror', (e) => ue.push('PAGEERROR ' + e.message))
await up.goto('http://localhost:3000/dashboard')
await up.waitForTimeout(5000)

// ADMIN: create game
const ac = await browser.newContext()
await ac.request.post('http://localhost:5000/api/auth/login', {
  data: { identifier: 'admin@luckyseat.com', password: 'AdminPass123!' },
})
const fd = new FormData()
fd.set('title', title)
fd.set('prize', 'Test Knife')
fd.set('totalSeats', '10')
fd.set('numberOfWinners', '1')
fd.set('endType', 'manual')
const createRes = await ac.request.post('http://localhost:5000/api/admin/games', {
  multipart: {
    title,
    prize: 'Test Knife',
    totalSeats: '10',
    numberOfWinners: '1',
    endType: 'manual',
  },
})
console.log('CREATE_STATUS', createRes.status())
let gameCode = null
try {
  const body = await createRes.json()
  gameCode = body?.data?.game?.gameCode ?? body?.data?.gameCode ?? body?.game?.gameCode
  console.log('GAME_CODE', gameCode)
} catch (e) {
  console.log('CREATE_BODY_ERR', e.message)
}

// USER: featured games should update WITHOUT reload
let gamesPass = false
try {
  await up.getByText(title, { exact: true }).waitFor({ timeout: 15000 })
  gamesPass = true
} catch { gamesPass = false }
console.log('INSTANT_GAMES_UPDATE', gamesPass ? 'PASS' : 'FAIL')

let toastPass = false
try {
  await up.getByText('New Game Alert').waitFor({ timeout: 8000 })
  toastPass = true
} catch { toastPass = false }
console.log('NEW_GAME_TOAST', toastPass ? 'PASS' : 'FAIL')

console.log('USER_ERRS', ue.length ? ue.join(' || ') : 'none')

// CLEANUP via DB
const mongoose = (await import('mongoose')).default
await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 })
const db = mongoose.connection.db
const game = await db.collection('games').findOne({ gameCode })
if (game) {
  await db.collection('notifications').deleteMany({ gameId: game._id })
  await db.collection('seats').deleteMany({ gameId: game._id })
  await db.collection('games').deleteOne({ _id: game._id })
  console.log('CLEANED', game._id.toString())
} else {
  console.log('NO_GAME_TO_CLEAN')
}
await mongoose.disconnect()

await browser.close()
process.exit(0)
