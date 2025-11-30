import { jest } from '@jest/globals'
import { restrictTo } from '../../middleware/auth.js';
import { setupTestEnv } from '../helpers.js';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeAll(() => {
    setupTestEnv();
  });

  beforeEach(() => {
    req = {
      headers: {},
      body: {},
    };
    
    res = {
      json: jest.fn(() => res),
      status: jest.fn(() => res),
    };
    
    next = jest.fn();
  });

  describe('restrictTo Middleware', () => {
    it('should create middleware function', () => {
      const middleware = restrictTo('admin');

      expect(typeof middleware).toBe('function');
    });

    it('should allow access for authorized role', () => {
      req.user = { role: 'admin' };
      const middleware = restrictTo('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      req.user = { role: 'user' };
      const middleware = restrictTo('admin');

      middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You do not have permission to perform this action'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle missing user', () => {
      const middleware = restrictTo('admin');

      middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not authenticated'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
