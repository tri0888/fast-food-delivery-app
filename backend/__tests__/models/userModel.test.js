import mongoose from 'mongoose';
import userModel from '../../models/userModel.js';
import { createMockUser } from '../helpers.js';

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid user with all required fields', () => {
      const mockUser = createMockUser();
      const user = new userModel(mockUser);

      expect(user.name).toBe(mockUser.name);
      expect(user.email).toBe(mockUser.email);
      expect(user.password).toBe(mockUser.password);
      expect(user.role).toBe('user');
      expect(user.cartData).toEqual({});
      expect(user.isCartLock).toBe(false);
    });

    it('should have default values for optional fields', () => {
      const user = new userModel({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123456',
      });

      expect(user.role).toBe('user');
      expect(user.cartData).toEqual({});
      expect(user.isCartLock).toBe(false);
    });

    it('should fail validation when name is missing', () => {
      const user = new userModel({
        email: 'test@example.com',
        password: 'Test123456',
      });

      const validationError = user.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.name).toBeDefined();
      expect(validationError.errors.name.message).toBe('An user must have a name');
    });

    it('should fail validation when email is missing', () => {
      const user = new userModel({
        name: 'Test User',
        password: 'Test123456',
      });

      const validationError = user.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.email).toBeDefined();
    });

    it('should fail validation when password is missing', () => {
      const user = new userModel({
        name: 'Test User',
        email: 'test@example.com',
      });

      const validationError = user.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.password).toBeDefined();
    });

    it('should allow admin role', () => {
      const user = new userModel({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin123456',
        role: 'admin',
      });

      expect(user.role).toBe('admin');
    });

    it('should allow user role (default)', () => {
      const user = new userModel({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123456',
      });

      expect(user.role).toBe('user');
    });

    it('should fail validation for invalid role', () => {
      const user = new userModel({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123456',
        role: 'superadmin',
      });

      const validationError = user.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.role).toBeDefined();
    });

    it('should allow cartData as object', () => {
      const user = new userModel({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123456',
        cartData: { 'food-123': 2, 'food-456': 1 },
      });

      expect(user.cartData).toEqual({ 'food-123': 2, 'food-456': 1 });
    });

    it('should allow isCartLock to be true', () => {
      const user = new userModel({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123456',
        isCartLock: true,
      });

      expect(user.isCartLock).toBe(true);
    });
  });

  describe('Model Structure', () => {
    it('should have correct field types', () => {
      const user = new userModel(createMockUser());

      expect(typeof user.name).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.password).toBe('string');
      expect(typeof user.role).toBe('string');
      expect(typeof user.cartData).toBe('object');
      expect(typeof user.isCartLock).toBe('boolean');
    });

    it('should have minimize option set to false', () => {
      const user = new userModel({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123456',
        cartData: {},
      });

      // The minimize: false option ensures empty objects are saved
      expect(user.cartData).toEqual({});
    });
  });

  describe('Unique Email Constraint', () => {
    it('should have unique email constraint in schema', () => {
      const schema = userModel.schema;
      const emailPath = schema.path('email');

      expect(emailPath.options.unique).toBe(true);
    });
  });
});
