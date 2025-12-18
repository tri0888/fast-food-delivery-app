import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import { createUser } from '../fixtures/dataFactory.js'
import User from '../../models/userModel.js'
import { dataIntegrityCartData } from './test-data/carts.js'

describe('Data Integrity · Carts (embedded cartData)', () => {
  beforeAll(async () => {
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('DAT_CART_DI_01 · removes entire cart blob when user document is deleted', async () => {
    const user = await createUser({ cartData: dataIntegrityCartData.buildCartPayload() })

    await User.deleteOne({ _id: user._id })

    const lookup = await User.findById(user._id)
    expect(lookup).toBeNull()
    expect(await User.countDocuments({ 'cartData.phantomFood': { $exists: true } })).toBe(0)
  })

  it('DAT_CART_DI_02 · removing a user via findByIdAndDelete clears cart footprint', async () => {
    const user = await createUser({ cartData: dataIntegrityCartData.buildCartPayload() })

    await User.findByIdAndDelete(user._id)

    const lookup = await User.findOne({ 'cartData.phantomFood': { $exists: true } })
    expect(lookup).toBeNull()
  })
})
