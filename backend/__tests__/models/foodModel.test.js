import mongoose from 'mongoose';
import foodModel from '../../models/foodModel.js';
import { createMockFood } from '../helpers.js';

describe('Food Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid food with all required fields', () => {
      const mockFood = createMockFood();
      const food = new foodModel(mockFood);

      expect(food.name).toBe(mockFood.name);
      expect(food.description).toBe(mockFood.description);
      expect(food.price).toBe(mockFood.price);
      expect(food.image).toBe(mockFood.image);
      expect(food.category).toBe(mockFood.category);
      expect(food.isAvailable).toBe(true);
      expect(food.stock).toBe(10);
    });

    it('should have default values for optional fields', () => {
      const food = new foodModel({
        name: 'Test Food',
        description: 'Test Description',
        price: 10.99,
        image: 'test.jpg',
        category: 'Salad',
      });

      expect(food.isAvailable).toBe(true);
      expect(food.stock).toBe(0);
      expect(food.createdAt).toBeDefined();
      expect(food.updatedAt).toBeDefined();
    });

    it('should fail validation when name is missing', () => {
      const food = new foodModel({
        description: 'Test Description',
        price: 10.99,
        image: 'test.jpg',
        category: 'Salad',
      });

      const validationError = food.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.name).toBeDefined();
      expect(validationError.errors.name.message).toBe('A food must have a name');
    });

    it('should fail validation when description is missing', () => {
      const food = new foodModel({
        name: 'Test Food',
        price: 10.99,
        image: 'test.jpg',
        category: 'Salad',
      });

      const validationError = food.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.description).toBeDefined();
    });

    it('should fail validation when price is missing', () => {
      const food = new foodModel({
        name: 'Test Food',
        description: 'Test Description',
        image: 'test.jpg',
        category: 'Salad',
      });

      const validationError = food.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.price).toBeDefined();
    });

    it('should fail validation when image is missing', () => {
      const food = new foodModel({
        name: 'Test Food',
        description: 'Test Description',
        price: 10.99,
        category: 'Salad',
      });

      const validationError = food.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.image).toBeDefined();
    });

    it('should fail validation when category is missing', () => {
      const food = new foodModel({
        name: 'Test Food',
        description: 'Test Description',
        price: 10.99,
        image: 'test.jpg',
      });

      const validationError = food.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.category).toBeDefined();
    });

    it('should allow custom stock value', () => {
      const food = new foodModel({
        name: 'Test Food',
        description: 'Test Description',
        price: 10.99,
        image: 'test.jpg',
        category: 'Salad',
        stock: 50,
      });

      expect(food.stock).toBe(50);
    });

    it('should allow isAvailable to be set to false', () => {
      const food = new foodModel({
        name: 'Test Food',
        description: 'Test Description',
        price: 10.99,
        image: 'test.jpg',
        category: 'Salad',
        isAvailable: false,
      });

      expect(food.isAvailable).toBe(false);
    });
  });

  describe('Model Structure', () => {
    it('should have correct field types', () => {
      const food = new foodModel(createMockFood());

      expect(typeof food.name).toBe('string');
      expect(typeof food.description).toBe('string');
      expect(typeof food.price).toBe('number');
      expect(typeof food.image).toBe('string');
      expect(typeof food.category).toBe('string');
      expect(typeof food.isAvailable).toBe('boolean');
      expect(typeof food.stock).toBe('number');
    });

    it('should auto-generate timestamps', () => {
      const food = new foodModel(createMockFood());

      expect(food.createdAt).toBeDefined();
      expect(food.updatedAt).toBeDefined();
      expect(food.createdAt instanceof Date).toBe(true);
      expect(food.updatedAt instanceof Date).toBe(true);
    });
  });
});
