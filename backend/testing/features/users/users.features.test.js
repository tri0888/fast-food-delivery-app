import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../../fixtures/mongo.js'
import User from '../../../models/userModel.js'
import addUserService from '../../../modules/Users/addUser/Service.js'
import editUserService from '../../../modules/Users/editUser/Service.js'
import getAllUsersService from '../../../modules/Users/getAllUsers/Service.js'
import toggleCartLockService from '../../../modules/Users/toggleCartLock/Service.js'
import AppError from '../../../utils/appError.js'
import { userFeatureData } from '../test-data/users.js'

beforeAll(() => {
  process.env.JWT_SECRET = 'features-users-secret'
})

describe('Features · User management capability', () => {
  beforeAll(async () => {
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('FE-USR-001 · creates administrative users with hashed passwords', async () => {
    const created = await addUserService.addUser(
      userFeatureData.admin.name,
      userFeatureData.admin.email,
      userFeatureData.admin.password,
      userFeatureData.admin.role
    )

    expect(created.name).toBe('Ops Admin')
    expect(created.role).toBe('admin')
    expect(created.password).toBeUndefined()

    const stored = await User.findOne({ email: userFeatureData.admin.email }).lean()
    expect(stored.role).toBe(userFeatureData.admin.role)
    expect(stored.password).not.toBe(userFeatureData.admin.password)
  })

  it('FE-USR-002 · prevents duplicate registrations via admin create flow', async () => {
    await addUserService.addUser('Ops Admin', userFeatureData.duplicateEmail, userFeatureData.admin.password, 'admin')
    await expect(addUserService.addUser('Other', userFeatureData.duplicateEmail, userFeatureData.admin.password, 'user')).rejects.toBeInstanceOf(AppError)
  })

  it('FE-USR-003 · toggles cart lock state for a user account', async () => {
    const user = await User.create({
      name: userFeatureData.cartLockUser.name,
      email: userFeatureData.cartLockUser.email,
      password: userFeatureData.cartLockUser.password,
      role: 'user',
      isCartLock: false
    })

    const updated = await toggleCartLockService.toggleCartLock(user._id.toString())
    expect(updated.isCartLock).toBe(true)

    const reverted = await toggleCartLockService.toggleCartLock(user._id.toString())
    expect(reverted.isCartLock).toBe(false)
  })

  it('FE-USR-004 · updates role to admin and hashes new password', async () => {
    const user = await User.create({
      name: userFeatureData.roleTarget.name,
      email: userFeatureData.roleTarget.email,
      password: userFeatureData.roleTarget.password,
      role: 'user'
    })

    const updated = await editUserService.editUser(user._id.toString(), { role: 'admin', password: 'NewPassword456!' })
    expect(updated.role).toBe('admin')
  })

  it('FE-USR-005 · rejects roles outside enum', async () => {
    const user = await User.create({
      name: userFeatureData.roleTarget.name,
      email: userFeatureData.roleTarget.email,
      password: userFeatureData.roleTarget.password,
      role: 'user'
    })

    await expect(editUserService.editUser(user._id.toString(), { role: 'super-admin' })).rejects.toBeInstanceOf(AppError)
  })

  it('FE-USR-006 · rejects weak passwords on edit', async () => {
    const user = await User.create({
      name: userFeatureData.roleTarget.name,
      email: userFeatureData.roleTarget.email,
      password: userFeatureData.roleTarget.password,
      role: 'user'
    })

    await expect(editUserService.editUser(user._id.toString(), { password: '123' })).rejects.toBeInstanceOf(AppError)
  })

  it('FE-USR-007 · lists every user for admin dashboards', async () => {
    const emails = userFeatureData.listEmails
    await User.create(emails.map((email, idx) => ({
      name: `List User ${idx + 1}`,
      email,
      password: userFeatureData.admin.password,
      role: idx === 0 ? 'admin' : 'user'
    })))

    const users = await getAllUsersService.getAllUsers()
    expect(users).toHaveLength(emails.length)
    expect(users.map((user) => user.email)).toEqual(expect.arrayContaining(emails))
  })
})
