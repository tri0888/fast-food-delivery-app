import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../../fixtures/mongo.js'
import User from '../../../models/userModel.js'
import addUserService from '../../../modules/Users/addUser/Service.js'
import editUserService from '../../../modules/Users/editUser/Service.js'
import getAllUsersService from '../../../modules/Users/getAllUsers/Service.js'
import toggleCartLockService from '../../../modules/Users/toggleCartLock/Service.js'
import AppError from '../../../utils/appError.js'

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

  it('creates administrative users with hashed passwords', async () => {
    const created = await addUserService.addUser('Ops Admin', 'ops.admin@example.com', 'Password123!', 'admin')

    expect(created.name).toBe('Ops Admin')
    expect(created.role).toBe('admin')
    expect(created.password).toBeUndefined()

    const stored = await User.findOne({ email: 'ops.admin@example.com' }).lean()
    expect(stored.role).toBe('admin')
    expect(stored.password).not.toBe('Password123!')
  })

  it('prevents duplicate registrations via admin create flow', async () => {
    await addUserService.addUser('Ops Admin', 'dup@example.com', 'Password123!', 'admin')
    await expect(addUserService.addUser('Other', 'dup@example.com', 'Password123!', 'user')).rejects.toBeInstanceOf(AppError)
  })

  it('toggles cart lock state for a user account', async () => {
    const user = await User.create({
      name: 'Cart Lock',
      email: 'cart.lock@example.com',
      password: 'Password123!',
      role: 'user',
      isCartLock: false
    })

    const updated = await toggleCartLockService.toggleCartLock(user._id.toString())
    expect(updated.isCartLock).toBe(true)

    const reverted = await toggleCartLockService.toggleCartLock(user._id.toString())
    expect(reverted.isCartLock).toBe(false)
  })

  it('edits user role and enforces validations', async () => {
    const user = await User.create({
      name: 'Role Target',
      email: 'role.target@example.com',
      password: 'Password123!',
      role: 'user'
    })

    const updated = await editUserService.editUser(user._id.toString(), { role: 'admin', password: 'NewPassword456!' })
    expect(updated.role).toBe('admin')

    await expect(editUserService.editUser(user._id.toString(), { role: 'super-admin' })).rejects.toBeInstanceOf(AppError)
    await expect(editUserService.editUser(user._id.toString(), { password: '123' })).rejects.toBeInstanceOf(AppError)
  })

  it('lists every user for admin dashboards', async () => {
    const emails = ['list-1@example.com', 'list-2@example.com']
    await User.create(emails.map((email, idx) => ({
      name: `List User ${idx + 1}`,
      email,
      password: 'Password123!',
      role: idx === 0 ? 'admin' : 'user'
    })))

    const users = await getAllUsersService.getAllUsers()
    expect(users).toHaveLength(emails.length)
    expect(users.map((user) => user.email)).toEqual(expect.arrayContaining(emails))
  })
})
