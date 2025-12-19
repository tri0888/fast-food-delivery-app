import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    // STRESS-001: baseline load only (keep it short and deterministic).
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<500']
  }
}

const BASE_URL = (__ENV.API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '')

const USER_EMAIL = __ENV.STRESS_USER_EMAIL
const USER_PASSWORD = __ENV.STRESS_USER_PASSWORD
const ENABLE_AUTH = (__ENV.STRESS_ENABLE_AUTH || '').toLowerCase() === 'true'

// Per-VU cached state.
let authToken
let cachedFoodId

function jsonHeaders(token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.token = token
  return { headers }
}

function ensureFoodId() {
  if (cachedFoodId) return cachedFoodId

  const res = http.get(`${BASE_URL}/api/food/list`)
  check(res, { 'food/list status is 200': (r) => r.status === 200 })

  try {
    const body = res.json()
    const data = body && body.data
    if (Array.isArray(data) && data[0] && data[0]._id) {
      cachedFoodId = data[0]._id
      return cachedFoodId
    }
  } catch {
    // ignore parse errors
  }

  return null
}

function ensureLogin() {
  if (authToken) return authToken
  if (!USER_EMAIL || !USER_PASSWORD) return null

  const res = http.post(
    `${BASE_URL}/api/user/login`,
    JSON.stringify({ email: USER_EMAIL, password: USER_PASSWORD }),
    jsonHeaders()
  )

  check(res, { 'user/login status is 200': (r) => r.status === 200 })

  try {
    const body = res.json()
    if (body && body.token) {
      authToken = body.token
      return authToken
    }
  } catch {
    // ignore parse errors
  }

  return null
}

export default function () {
  // Always keep the public browse endpoint in the mix.
  const listRes = http.get(`${BASE_URL}/api/food/list`)
  check(listRes, {
    'food/list status is 200': (r) => r.status === 200
  })

  // Optional authenticated flow when creds are available.
  const token = ENABLE_AUTH ? ensureLogin() : null
  if (token) {
    http.get(`${BASE_URL}/api/cart/get`, jsonHeaders(token))

    const foodId = cachedFoodId || ensureFoodId()
    if (foodId) {
      const addRes = http.post(
        `${BASE_URL}/api/cart/add`,
        JSON.stringify({ itemId: foodId }),
        jsonHeaders(token)
      )
      check(addRes, { 'cart/add status is 200': (r) => r.status === 200 })

      const removeRes = http.post(
        `${BASE_URL}/api/cart/remove`,
        JSON.stringify({ itemId: foodId, removeCompletely: true }),
        jsonHeaders(token)
      )
      check(removeRes, { 'cart/remove status is 200': (r) => r.status === 200 })
    }
  }

  sleep(1)
}
