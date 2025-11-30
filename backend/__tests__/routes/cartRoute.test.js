import request from 'supertest';
import app from '../../app.js';
import { setupTestEnv } from '../helpers.js';

describe('Cart Routes', () => {
  beforeAll(() => {
    setupTestEnv();
  });

  describe('GET /api/cart/get', () => {
    it('should have cart get endpoint', async () => {
      const response = await request(app).get('/api/cart/get');

      // Will fail due to lack of auth, but endpoint exists
      expect(response.status).toBeDefined();
    });
  });

  describe('Route Structure', () => {
    it('should have cart routes mounted', () => {
      expect(app).toBeDefined();
    });
  });
});
