import { describe, it, expect, jest, beforeAll, afterAll, afterEach } from '@jest/globals'
import AppError from '../../../utils/appError.js'
import { userUnitData } from '../test-data/users.js'
import bcrypt from 'bcrypt'

const mockLoginRepository = {
  findByEmail: jest.fn()
}

jest.unstable_mockModule('../../../modules/Users/login/Repository.js', () => ({
  __esModule: true,
  default: mockLoginRepository
}))

const mockRegisterRepository = {
  findByEmail: jest.fn(),
  create: jest.fn()
}

jest.unstable_mockModule('../../../modules/Users/register/Repository.js', () => ({
  __esModule: true,
  default: mockRegisterRepository
}))

const mockToggleService = {
  toggleCartLock: jest.fn()
}

jest.unstable_mockModule('../../../modules/Users/toggleCartLock/Service.js', () => ({
  __esModule: true,
  default: mockToggleService
}))

const { default: loginService } = await import('../../../modules/Users/login/Service.js')
const { default: registerService } = await import('../../../modules/Users/register/Service.js')
const { toggleCartLock } = await import('../../../modules/Users/toggleCartLock/Controller.js')

describe('Unit · User surface', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'unit-user-secret'
  })

  afterAll(() => {
    delete process.env.JWT_SECRET
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('UNI_USER_UNIT_01 / UNI_USER_UNIT_02 · login compares plaintext password with hashed digest', async () => {
    const compareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)
    const credentials = userUnitData.loginFlow.credentials
    mockLoginRepository.findByEmail.mockResolvedValue({
      _id: 'user-login',
      password: credentials.hashedDigest,
      role: 'user'
    })

    const response = await loginService.login(credentials.email, credentials.plaintext)

    expect(compareSpy).toHaveBeenCalledWith(credentials.plaintext, credentials.hashedDigest)
    expect(response.token).toEqual(expect.any(String))
    expect(response.role).toBe('user')

    compareSpy.mockRestore()
  })

  it('UNI_USER_UNIT_03 / UNI_USER_UNIT_04 · register catches repository failures', async () => {
    mockRegisterRepository.findByEmail.mockResolvedValue(null)
    mockRegisterRepository.create.mockRejectedValue(new Error('connection lost'))

    jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt')
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash')

    const payload = userUnitData.registerFlow.payload

    await expect(
      registerService.register(payload.name, payload.email, payload.password)
    ).rejects.toBeInstanceOf(AppError)
  })

  it('UNI_USER_UNIT_05 / UNI_USER_UNIT_06 · toggleCartLock controller reflects new boolean state', async () => {
    const req = {
      body: { ...userUnitData.toggleCartLock.request.body }
    }
    const json = jest.fn()
    const res = { json }
    const next = jest.fn()

    mockToggleService.toggleCartLock.mockResolvedValue({
      _id: userUnitData.toggleCartLock.response.userId,
      isCartLock: userUnitData.toggleCartLock.response.isCartLock
    })

    await toggleCartLock(req, res, next)

    expect(json).toHaveBeenCalledWith({
      success: true,
      message: 'Cart lock status updated',
      data: userUnitData.toggleCartLock.response
    })
  })
})
