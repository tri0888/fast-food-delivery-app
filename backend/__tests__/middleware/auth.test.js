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
      json: () => {},
      status: () => res,
    };
    
    next = () => {};
  });

  describe('restrictTo Middleware', () => {
    it('should create middleware function', () => {
      const middleware = restrictTo('admin');

      expect(typeof middleware).toBe('function');
    });

    it('should allow access for authorized role', () => {
      req.user = { role: 'admin' };
      const middleware = restrictTo('admin');
      let nextCalled = false;
      next = () => { nextCalled = true; };

      middleware(req, res, next);

      expect(nextCalled).toBe(true);
    });

    it('should deny access for unauthorized role', () => {
      req.user = { role: 'user' };
      const middleware = restrictTo('admin');
      let jsonCalled = false;
      res.json = () => { jsonCalled = true; return res; };

      middleware(req, res, next);

      expect(jsonCalled).toBe(true);
    });

    it('should handle missing user', () => {
      const middleware = restrictTo('admin');
      let jsonCalled = false;
      res.json = () => { jsonCalled = true; return res; };

      middleware(req, res, next);

      expect(jsonCalled).toBe(true);
    });
  });
});
