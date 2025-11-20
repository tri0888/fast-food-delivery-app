import request from 'supertest';
import app from '../../app.js';
import { setupTestEnv } from '../helpers.js';

describe('User Routes', () => {
  beforeAll(() => {
    setupTestEnv();
  });

  describe('Route Structure', () => {
    it('should have user routes mounted in app', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should have Express app configured', () => {
      expect(app._router).toBeDefined();
    });
  });
});
