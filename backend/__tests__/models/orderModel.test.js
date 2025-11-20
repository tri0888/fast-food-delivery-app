import mongoose from 'mongoose';
import orderModel from '../../models/orderModel.js';
import { createMockOrder } from '../helpers.js';

describe('Order Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid order with all required fields', () => {
      const mockOrder = createMockOrder('user-123');
      const order = new orderModel(mockOrder);

      expect(order.userId).toBe('user-123');
      expect(Array.isArray(order.items)).toBe(true);
      expect(order.items.length).toBeGreaterThan(0);
      expect(order.amount).toBe(21.98);
      expect(order.address).toBeDefined();
      expect(order.status).toBe('Food Processing');
      expect(order.payment).toBe(false);
    });

    it('should have default values for optional fields', () => {
      const order = new orderModel({
        userId: 'user-123',
        items: [{ name: 'Test Food', quantity: 1, price: 10.99 }],
        amount: 10.99,
        address: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          street: '123 Test St',
          city: 'Test City',
        },
      });

      expect(order.status).toBe('Food Processing');
      expect(order.payment).toBe(false);
      expect(order.date).toBeDefined();
    });

    it('should fail validation when userId is missing', () => {
      const order = new orderModel({
        items: [{ name: 'Test Food', quantity: 1, price: 10.99 }],
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
        items: [],
        amount: 10.99,
        address: { street: '123 Test St' },
      });

      expect(order.items).toEqual([]);
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
        items: [{ name: 'Test Food', quantity: 1, price: 10.99 }],
        amount: 10.99,
      });

      const validationError = order.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.address).toBeDefined();
    });

    it('should allow custom status', () => {
      const order = new orderModel({
        userId: 'user-123',
        items: [{ name: 'Test Food', quantity: 1, price: 10.99 }],
        amount: 10.99,
        address: { street: '123 Test St' },
        status: 'Out for delivery',
      });

      expect(order.status).toBe('Out for delivery');
    });

    it('should allow payment to be true', () => {
      const order = new orderModel({
        userId: 'user-123',
        items: [{ name: 'Test Food', quantity: 1, price: 10.99 }],
        amount: 10.99,
        address: { street: '123 Test St' },
        payment: true,
      });

      expect(order.payment).toBe(true);
    });

    it('should store items as array of objects', () => {
      const items = [
        { name: 'Pizza', quantity: 2, price: 12.99 },
        { name: 'Burger', quantity: 1, price: 8.99 },
      ];

      const order = new orderModel({
        userId: 'user-123',
        items,
        amount: 34.97,
        address: { street: '123 Test St' },
      });

      expect(order.items).toEqual(items);
      expect(order.items.length).toBe(2);
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
        items: [{ name: 'Test Food', quantity: 1, price: 10.99 }],
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
      expect(Array.isArray(order.items)).toBe(true);
      expect(typeof order.amount).toBe('number');
      expect(typeof order.address).toBe('object');
      expect(typeof order.status).toBe('string');
      expect(typeof order.payment).toBe('boolean');
      expect(order.date instanceof Date).toBe(true);
    });

    it('should auto-generate date on creation', () => {
      const order = new orderModel({
        userId: 'user-123',
        items: [{ name: 'Test Food', quantity: 1, price: 10.99 }],
        amount: 10.99,
        address: { street: '123 Test St' },
      });

      expect(order.date).toBeDefined();
      expect(order.date instanceof Date).toBe(true);
    });
  });

  describe('Order Status Values', () => {
    const validStatuses = [
      'Food Processing',
      'Out for delivery',
      'Delivered',
    ];

    validStatuses.forEach((status) => {
      it(`should allow status: ${status}`, () => {
        const order = new orderModel({
          userId: 'user-123',
          items: [{ name: 'Test Food', quantity: 1, price: 10.99 }],
          amount: 10.99,
          address: { street: '123 Test St' },
          status,
        });

        expect(order.status).toBe(status);
      });
    });
  });
});
