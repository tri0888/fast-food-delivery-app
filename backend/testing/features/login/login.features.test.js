import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../../fixtures/mongo.js'
import AppError from '../../../utils/appError.js'

const { default: registerService } = await import('../../../modules/Users/register/Service.js')
const { default: loginService } = await import('../../../modules/Users/login/Service.js')

beforeAll(() => {
  process.env.JWT_SECRET = 'features-login-secret'
})

describe('Features · Login capability', () => {
  beforeAll(async () => {
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('registers a user then authenticates returning a role + token', async () => {
    const email = `features-login+${Date.now()}@example.com`
    const registration = await registerService.register('Feature User', email, 'Password123!')

    expect(registration.token).toBeTruthy()

    const login = await loginService.login(email, 'Password123!')
    expect(login.token).toBeTruthy()
    expect(login.role).toBe('user')
  })

  it('rejects malformed or missing credentials', async () => {
    await expect(loginService.login('  ', '  ')).rejects.toBeInstanceOf(AppError)
    await expect(loginService.login('invalid-email', 'Password123!')).rejects.toBeInstanceOf(AppError)
  })

  it('blocks incorrect password and unknown users', async () => {
    const email = `features-login-wrong+${Date.now()}@example.com`
    await registerService.register('Wrong Password', email, 'Password123!')

    await expect(loginService.login(email, 'BadPassword!')).rejects.toThrow('Incorrect Password')
    await expect(loginService.login('ghost@example.com', 'Password123!')).rejects.toThrow('Incorrect Email')
  })
})
