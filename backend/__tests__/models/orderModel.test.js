import mongoose from 'mongoose';
import orderModel from '../../models/orderModel.js';
import { createMockOrder } from '../helpers.js';

describe('Order Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid order with all required fields', () => {
      const mockOrder = createMockOrder('user-123');
      const order = new orderModel(mockOrder);

      expect(order.userId).toBe('user-123');
      expect(Array.isArray(order.food_items)).toBe(true);
      expect(order.food_items.length).toBeGreaterThan(0);
      expect(order.amount).toBe(21.98);
      expect(order.address).toBeDefined();
      expect(order.status).toBe('Pending Confirmation');
    });

    it('should have default values for optional fields', () => {
      const order = new orderModel({
        userId: 'user-123',
        food_items: [{ foodId: new mongoose.Types.ObjectId(), name: 'Test Food', quantity: 1, price: 10.99 }],
        amount: 10.99,
        address: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          street: '123 Test St',
          city: 'Test City',
        },
      });

      expect(order.status).toBe('Pending Confirmation');
      expect(order.date).toBeDefined();
    });

    it('should fail validation when userId is missing', () => {
      const order = new orderModel({
        food_items: [{ foodId: new mongoose.Types.ObjectId(), name: 'Test Food', quantity: 1, price: 10.99 }],
        amount: 10.99,
        address: { street: '123 Test St' },
      });

      const validationError = order.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.userId).toBeDefined();
      expect(validationError.errors.userId.message).toBe('An order must have a userId');
    });

    it('should allow empty items array (Mongoose doesn\'t validate arrays)', () => {
      const order = new orderModel({
        userId: 'user-123',
        food_items: [],
        amount: 10.99,
        address: { street: '123 Test St' },
      });

      expect(Array.isArray(order.food_items)).toBe(true);
      expect(order.food_items.length).toBe(0);
    });

    it('should fail validation when amount is missing', () => {
      const order = new orderModel({
        userId: 'user-123',
        items: [{ name: 'Test Food', quantity: 1, price: 10.99 }],
        address: { street: '123 Test St' },
      });

      const validationError = order.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.amount).toBeDefined();
    });

    it('should fail validation when address is missing', () => {
      const order = new orderModel({
        userId: 'user-123',
        food_items: [{ foodId: new mongoose.Types.ObjectId(), name: 'Test Food', quantity: 1, price: 10.99 }],
        amount: 10.99,
      });

      const validationError = order.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.address).toBeDefined();
    });

    it('should allow custom status', () => {
      const order = new orderModel({
        userId: 'user-123',
        food_items: [{ foodId: new mongoose.Types.ObjectId(), name: 'Test Food', quantity: 1, price: 10.99 }],
        amount: 10.99,
        address: { street: '123 Test St' },
        status: 'Out for delivery',
      });

      expect(order.status).toBe('Out for delivery');
    });

    it('should store items as array of objects', () => {
      const items = [
        { foodId: new mongoose.Types.ObjectId(), name: 'Pizza', quantity: 2, price: 12.99 },
        { foodId: new mongoose.Types.ObjectId(), name: 'Burger', quantity: 1, price: 8.99 },
      ];

      const order = new orderModel({
        userId: 'user-123',
        food_items: items,
        amount: 34.97,
        address: { street: '123 Test St' },
      });

      const storedItems = order.food_items.map((item) => item.toObject());
      expect(storedItems).toEqual(items);
      expect(order.food_items.length).toBe(2);
    });

    it('should store address as object', () => {
      const address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipcode: '12345',
        country: 'Test Country',
        phone: '1234567890',
      };

      const order = new orderModel({
        userId: 'user-123',
        food_items: [{ foodId: new mongoose.Types.ObjectId(), name: 'Test Food', quantity: 1, price: 10.99 }],
        amount: 10.99,
        address,
      });

      expect(order.address).toEqual(address);
    });
  });

  describe('Model Structure', () => {
    it('should have correct field types', () => {
      const order = new orderModel(createMockOrder('user-123'));

      expect(typeof order.userId).toBe('string');
      expect(Array.isArray(order.food_items)).toBe(true);
      expect(typeof order.amount).toBe('number');
      expect(typeof order.address).toBe('object');
      expect(typeof order.status).toBe('string');
      expect(order.date instanceof Date).toBe(true);
    });

    it('should auto-generate date on creation', () => {
      const order = new orderModel({
        userId: 'user-123',
        food_items: [{ foodId: new mongoose.Types.ObjectId(), name: 'Test Food', quantity: 1, price: 10.99 }],
        amount: 10.99,
        address: { street: '123 Test St' },
      });

      expect(order.date).toBeDefined();
      expect(order.date instanceof Date).toBe(true);
    });
  });

  describe('Order Status Values', () => {
    const validStatuses = [
      'Pending Confirmation',
      'Confirmed',
      'Out for delivery',
      'Delivered',
      'Cancelled'
    ];

    validStatuses.forEach((status) => {
      it(`should allow status: ${status}`, () => {
        const order = new orderModel({
          userId: 'user-123',
          food_items: [{ foodId: new mongoose.Types.ObjectId(), name: 'Test Food', quantity: 1, price: 10.99 }],
          amount: 10.99,
          address: { street: '123 Test St' },
          status,
        });

        expect(order.status).toBe(status);
      });
    });
  });
});
