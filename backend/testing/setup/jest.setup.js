import mongoose from 'mongoose'
import { jest, afterAll } from '@jest/globals'

jest.setTimeout(30000)

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
  }
})
