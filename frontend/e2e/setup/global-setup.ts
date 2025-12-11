import axios from 'axios'
import path from 'path'
import fs from 'fs/promises'

const log = (...args: unknown[]) => console.log('[playwright:setup]', ...args)

export default async function globalSetup() {
  const resetEndpoint = process.env.PLAYWRIGHT_RESET_URL || 'http://127.0.0.1:5000/api/test/reset'
  try {
    log('Attempting to reset backend fixtures via', resetEndpoint)
    await axios.post(resetEndpoint).catch(() => undefined)
  } catch (error) {
    log('Skip backend reset (endpoint unavailable)', error)
  }

  const authDir = path.resolve(process.cwd(), 'e2e/.auth')
  await fs.mkdir(authDir, { recursive: true })
  await fs.writeFile(path.join(authDir, 'customer-state.json'), JSON.stringify({}), { encoding: 'utf-8' })
}
