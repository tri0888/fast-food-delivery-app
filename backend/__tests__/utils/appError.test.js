import AppError from '../../utils/appError.js';

describe('AppError Utility', () => {
  it('should create an error with message and status code', () => {
    const error = new AppError('Test error message', 404);

    expect(error.message).toBe('Test error message');
    expect(error.statusCode).toBe(404);
  });

  it('should set status to "fail" for 4xx errors', () => {
    const error400 = new AppError('Bad Request', 400);
    const error404 = new AppError('Not Found', 404);

    expect(error400.status).toBe('fail');
    expect(error404.status).toBe('fail');
  });

  it('should set status to "error" for 5xx errors', () => {
    const error500 = new AppError('Internal Server Error', 500);
    const error503 = new AppError('Service Unavailable', 503);

    expect(error500.status).toBe('error');
    expect(error503.status).toBe('error');
  });

  it('should mark error as operational', () => {
    const error = new AppError('Test error', 400);

    expect(error.isOperational).toBe(true);
  });

  it('should be instance of Error', () => {
    const error = new AppError('Test error', 400);

    expect(error instanceof Error).toBe(true);
    expect(error instanceof AppError).toBe(true);
  });

  it('should capture stack trace', () => {
    const error = new AppError('Test error', 400);

    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
  });

  it('should handle different status codes correctly', () => {
    const testCases = [
      { statusCode: 400, expectedStatus: 'fail' },
      { statusCode: 401, expectedStatus: 'fail' },
      { statusCode: 403, expectedStatus: 'fail' },
      { statusCode: 404, expectedStatus: 'fail' },
      { statusCode: 500, expectedStatus: 'error' },
      { statusCode: 502, expectedStatus: 'error' },
      { statusCode: 503, expectedStatus: 'error' },
    ];

    testCases.forEach(({ statusCode, expectedStatus }) => {
      const error = new AppError('Test error', statusCode);
      expect(error.status).toBe(expectedStatus);
    });
  });

  it('should preserve error message', () => {
    const messages = [
      'Resource not found',
      'Unauthorized access',
      'Invalid input data',
      'Internal server error',
    ];

    messages.forEach((message) => {
      const error = new AppError(message, 400);
      expect(error.message).toBe(message);
    });
  });
});
