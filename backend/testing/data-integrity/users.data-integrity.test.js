import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import bcrypt from 'bcrypt'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import User from '../../models/userModel.js'
import { dataIntegrityUserData } from './test-data/users.js'

const { default: registerService } = await import('../../modules/Users/register/Service.js')

describe('Data Integrity · Users schema (CSV aligned)', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'data-integrity-user'
    await connectInMemoryMongo()
    await User.init()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('DAT_USER_DI_01 · rejects duplicate email inserts via ODM layer', async () => {
    const email = 'unique@example.com'
    await User.create(dataIntegrityUserData.buildUser({ email }))

    await expect(User.create(dataIntegrityUserData.buildUser({ email }))).rejects.toThrow(/duplicate/i)
  })

  it('DAT_USER_DI_02 · rejects duplicate email inserts at raw collection level', async () => {
    const email = 'raw@example.com'
    await User.collection.insertOne(dataIntegrityUserData.buildUser({ email }))

    await expect(
      User.collection.insertOne(dataIntegrityUserData.buildUser({ email }))
    ).rejects.toThrow(/duplicate/i)
  })

  it('DAT_USER_DI_03 · passwords stored via register service are hashed, not plain text', async () => {
    const payload = dataIntegrityUserData.buildUser({ email: 'hash-check@example.com' })

    await registerService.register(payload.name, payload.email, payload.password)
    const stored = await User.findOne({ email: payload.email }).lean()

    expect(stored.password).not.toBe(payload.password)
    expect(await bcrypt.compare(payload.password, stored.password)).toBe(true)
  })

  it('DAT_USER_DI_04 · selecting users from DB never reveals plain-text password', async () => {
    const payload = dataIntegrityUserData.buildUser({ email: 'select-check@example.com' })
    await registerService.register(payload.name, payload.email, payload.password)

    const fetched = await User.find({}, { password: 1, email: 1 }).lean()
    expect(fetched).not.toHaveLength(0)

    fetched.forEach((doc) => {
      expect(doc.password).toMatch(/\$2[aby]\$\d{2}\$/) // bcrypt signature
      expect(doc.password).not.toContain(payload.password)
    })
  })
})
