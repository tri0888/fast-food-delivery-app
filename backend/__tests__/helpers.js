import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * Generate JWT token for testing
 */
export const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'test-secret-key-123',
    { expiresIn: '1h' }
  );
};

/**
 * Create mock food data
 */
export const createMockFood = (overrides = {}) => {
  return {
    name: 'Test Food',
    description: 'Test food description',
    price: 10.99,
    image: 'test-image.jpg',
    category: 'Salad',
    isAvailable: true,
    stock: 10,
    ...overrides,
  };
};

/**
 * Create mock user data
 */
export const createMockUser = (overrides = {}) => {
  return {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test123456',
    role: 'user',
    cartData: {},
    cartLocks: {},
    ...overrides,
  };
};

/**
 * Create mock admin user data
 */
export const createMockAdmin = (overrides = {}) => {
  return {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123456',
    role: 'admin',
    cartData: {},
    cartLocks: {},
    ...overrides,
  };
};

/**
 * Create mock order data
 */
export const createMockOrder = (userId, overrides = {}) => {
  const foodId = new mongoose.Types.ObjectId().toString();
  return {
    userId,
    res_id: new mongoose.Types.ObjectId(),
    food_items: [
      {
        foodId,
        name: 'Test Food',
        quantity: 2,
        price: 10.99,
        image: 'test-image.jpg'
      },
    ],
    amount: 21.98,
    address: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipcode: '12345',
      country: 'Test Country',
      phone: '1234567890',
    },
    status: 'Pending Confirmation',
    paymentStatus: 'pending',
    ...overrides,
  };
};

/**
 * Mock MongoDB connection
 */
export const mockMongoose = () => {
  return {
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      close: jest.fn().mockResolvedValue(true),
      on: jest.fn(),
    },
  };
};

/**
 * Setup test environment variables
 */
export const setupTestEnv = () => {
  process.env.JWT_SECRET = 'test-secret-key-123';
  process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';
  process.env.DB_STRING = 'mongodb://localhost:27017/test-db';
  process.env.FRONTEND_URL = 'http://localhost:3000';
};


