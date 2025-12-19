import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import http from 'node:http'
import { once } from 'node:events'
import path from 'node:path'

import app from '../../app.js'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import { createFood } from '../fixtures/dataFactory.js'
import { createUser } from '../fixtures/dataFactory.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const script = path.resolve(__dirname, 'k6-orders.js')

function run(command, args, envOverrides = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, ...envOverrides }
    })

    let error

    child.on('error', (err) => {
      error = err
    })

    child.on('close', (code, signal) => {
      resolve({
        status: typeof code === 'number' ? code : signal ? 1 : 0,
        signal,
        error
      })
    })
  })
}

async function commandExists(command) {
  if (!command) return false
  if (command.includes('/') || command.includes('\\')) {
    try {
      await access(command)
      return true
    } catch {
      return false
    }
  }
  const checker = process.platform === 'win32' ? 'where' : 'which'
  const result = await run(checker, [command])
  return result.status === 0
}

function remapBaseUrlForDocker(url) {
  if (!url) return url
  try {
    const parsed = new URL(url)
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) {
      parsed.hostname = 'host.docker.internal'
      return parsed.toString().replace(/\/$/, '')
    }
    return url
  } catch {
    return url
  }
}

function runDockerFallback(envOverrides = {}) {
  const envArgs = Object.entries(envOverrides).flatMap(([key, value]) => ['-e', `${key}=${value}`])
  const dockerArgs = [
    'run',
    '--rm',
    '-i',
    '--add-host',
    'host.docker.internal:host-gateway',
    ...envArgs,
    '-v',
    `${__dirname}:/scripts`,
    'grafana/k6',
    'run',
    '/scripts/k6-orders.js'
  ]
  return run('docker', dockerArgs)
}

function ping(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume()
      resolve(true)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(1500, () => {
      req.destroy()
      resolve(false)
    })
  })
}

async function ensureApiAvailable() {
  const providedBaseUrl = process.env.API_BASE_URL || 'http://localhost:4000'
  const healthUrl = new URL('/api/food/list', providedBaseUrl).toString()
  const isReachable = await ping(healthUrl)

  if (isReachable) {
    return {
      baseUrl: providedBaseUrl,
      async teardown() {}
    }
  }

  console.warn('[stress] API not reachable at %s. Bootstrapping ephemeral server...', providedBaseUrl)

  // Auth endpoints require a JWT secret.
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'stress-jwt-secret'
  }

  await connectInMemoryMongo()
  await resetDatabase()
  await Promise.all(
    Array.from({ length: 5 }).map((_, idx) =>
      createFood({ name: `Load Test Item ${idx + 1}`, price: 10 + idx })
    )
  )

  // Seed a deterministic user so k6 can optionally exercise authenticated endpoints.
  const stressEmail = process.env.STRESS_USER_EMAIL || 'stress.user@example.com'
  const stressPassword = process.env.STRESS_USER_PASSWORD || 'Password123!'
  try {
    await createUser({ email: stressEmail, password: stressPassword, name: 'Stress User' })
  } catch {
    // If unique constraint collides, ignore; k6 will still be able to login if user exists.
  }

  const listenHost = '127.0.0.1'
  const server = app.listen(0, listenHost)
  await once(server, 'listening')
  const { port } = server.address()
  const baseUrl = `http://${listenHost}:${port}`

  console.info('[stress] Ephemeral API started at %s', baseUrl)

  return {
    baseUrl,
    async teardown() {
      await new Promise((resolve) => server.close(resolve))
      await disconnectInMemoryMongo()
    }
  }
}

const controller = await ensureApiAvailable()
const envOverrides = {
  API_BASE_URL: controller.baseUrl,
  // Baseline STRESS-001 focuses on public browse endpoint. Keep auth flow OFF by default.
  STRESS_ENABLE_AUTH: process.env.STRESS_ENABLE_AUTH || 'false'
}

// Only pass creds to k6 when explicitly provided.
if (process.env.STRESS_USER_EMAIL && process.env.STRESS_USER_PASSWORD) {
  envOverrides.STRESS_USER_EMAIL = process.env.STRESS_USER_EMAIL
  envOverrides.STRESS_USER_PASSWORD = process.env.STRESS_USER_PASSWORD
}

const k6Command = process.env.K6_BIN || 'k6'
let result

if (await commandExists(k6Command)) {
  result = await run(k6Command, ['run', script], envOverrides)
} else {
  console.warn('[stress] Local k6 not available, attempting docker fallback...')
  const dockerEnvOverrides = {
    ...envOverrides,
    API_BASE_URL: remapBaseUrlForDocker(envOverrides.API_BASE_URL)
  }
  result = await runDockerFallback(dockerEnvOverrides)
}

await controller.teardown()

if (result.error || result.status !== 0) {
  console.error('[stress] Unable to execute k6 load test. Install k6 or ensure Docker is running.')
  process.exit(result.status || 1)
}
