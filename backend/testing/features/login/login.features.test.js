import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../../fixtures/mongo.js'
import AppError from '../../../utils/appError.js'
import { loginFeatureData } from '../test-data/login.js'

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

  it('FE-LOGIN-001 · registers a user then authenticates returning a role + token', async () => {
    const email = loginFeatureData.buildEmail('happy')
    const registration = await registerService.register(loginFeatureData.defaultName, email, loginFeatureData.strongPassword)

    expect(registration.token).toBeTruthy()

    const login = await loginService.login(email, loginFeatureData.strongPassword)
    expect(login.token).toBeTruthy()
    expect(login.role).toBe('user')
  })

  it('FE-LOGIN-002 · rejects when both email and password are missing', async () => {
    await expect(loginService.login(loginFeatureData.whitespace, loginFeatureData.whitespace)).rejects.toBeInstanceOf(AppError)
  })

  it('FE-LOGIN-003 · rejects invalid email formats', async () => {
    await expect(loginService.login('invalid-email', loginFeatureData.strongPassword)).rejects.toBeInstanceOf(AppError)
  })

  it('FE-LOGIN-004 · blocks incorrect password', async () => {
    const email = loginFeatureData.buildEmail('wrong')
    await registerService.register('Wrong Password', email, loginFeatureData.strongPassword)

    await expect(loginService.login(email, loginFeatureData.badPassword)).rejects.toThrow('Incorrect Password')
  })

  it('FE-LOGIN-005 · blocks unknown users', async () => {
    await expect(loginService.login('ghost@example.com', loginFeatureData.strongPassword)).rejects.toThrow('Incorrect Email')
  })
})
