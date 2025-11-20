# Backend Testing Documentation

## Overview
This document describes the comprehensive test suite created for the fast-food-delivery-app backend API.

## Test Setup

### Testing Stack
- **Jest** (v29.7.0) - JavaScript testing framework
- **Supertest** (v7.0.0) - HTTP assertion library for API testing
- **Node.js ES Modules** - Native ES6 module support

### Configuration Files
- `jest.config.js` - Jest configuration with ES modules support
- `package.json` - Test scripts and dependencies

### Test Scripts
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Test Structure

### Directory Layout
```
backend/__tests__/
├── helpers.js              # Test utilities and mock data factories
├── middleware/
│   └── auth.test.js        # Authentication middleware tests
├── models/
│   ├── foodModel.test.js   # Food model validation tests
│   ├── userModel.test.js   # User model validation tests
│   └── orderModel.test.js  # Order model validation tests
├── routes/
│   ├── foodRoute.test.js   # Food API endpoint tests
│   ├── userRoute.test.js   # User API endpoint tests
│   ├── cartRoute.test.js   # Cart API endpoint tests
│   └── orderRoute.test.js  # Order API endpoint tests
└── utils/
    └── appError.test.js    # Error utility tests
```

## Test Coverage

### Test Summary
- **Total Test Suites**: 9
- **Total Tests**: 59
- **Pass Rate**: 100% (59/59)

### Coverage Breakdown

#### Models (100% coverage for tested models)
- **foodModel.js**: 11 tests covering schema validation, defaults, and field types
- **userModel.js**: 13 tests covering user schema, roles, and cart data
- **orderModel.js**: 15 tests covering order creation, validation, and status

#### Routes (96% coverage)
- **foodRoute.js**: 2 tests - route structure and configuration
- **userRoute.js**: 2 tests - route structure and configuration
- **cartRoute.js**: 2 tests - cart endpoint and route structure
- **orderRoute.js**: 2 tests - order verify endpoint and structure

#### Middleware
- **auth.js**: 4 tests - restrictTo middleware for role-based access control

#### Utils
- **appError.js**: 8 tests - custom error class functionality (100% coverage)

## Test Utilities (`helpers.js`)

### Mock Data Factories
```javascript
createMockFood()      // Generate mock food items
createMockUser()      // Generate mock users
createMockAdmin()     // Generate mock admin users
createMockOrder()     // Generate mock orders
```

### Helper Functions
```javascript
generateToken(userId, role)  // Create JWT tokens for testing
setupTestEnv()              // Setup test environment variables
mockMongoose()              // Mock MongoDB connection
```

## Key Test Features

### 1. Model Validation Tests
- Test all required fields
- Validate default values
- Check field types and constraints
- Test enum values (roles, order status)
- Verify Mongoose schema options

### 2. Route Tests
- Validate route configuration
- Test Express app structure
- Verify endpoint existence
- Check middleware integration

### 3. Middleware Tests
- Test role-based access control
- Validate authorization logic
- Check error handling

### 4. Error Handling Tests
- Test custom AppError class
- Validate status codes (4xx vs 5xx)
- Check error message formatting

## Running Tests

### Local Development
```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### CI/CD Integration
Tests are automatically run in the CI/CD pipeline using:
```bash
npm test --if-present
```

## Coverage Report

### Overall Coverage
```
Statement Coverage: ~15-20% (focused on critical paths)
Branch Coverage: ~20%
Function Coverage: ~12.5%
Line Coverage: ~16.66%
```

### High Coverage Areas
- **Routes**: 96% coverage
- **Models** (tested): 100% coverage
- **AppError utility**: 100% coverage
- **Middleware** (tested portions): 100% coverage

### Areas for Future Improvement
- Controller logic (currently 0-16%)
- Service layer (currently 0-4%)
- Repository layer (currently 0%)
- Payment integration (currently 18%)
- API features utility (currently 0%)

## Best Practices

### 1. Test Naming
- Use descriptive test names
- Follow pattern: "should [expected behavior]"
- Group related tests with describe blocks

### 2. Test Organization
- One test file per source file
- Mirror source directory structure
- Keep tests focused and isolated

### 3. Mock Data
- Use factory functions for consistent test data
- Keep mock data realistic
- Reuse common test utilities

### 4. Assertions
- Test one thing per test
- Use specific assertions
- Include error messages for clarity

## Troubleshooting

### Common Issues

#### ES Modules with Jest
- Use `node --experimental-vm-modules` to run Jest
- Configure `jest.config.js` for ES modules
- Import statements must include `.js` extension

#### Mongoose Timeouts
- Tests timeout when accessing real database
- Use mocks or test database for integration tests
- Keep unit tests isolated from database

#### File Discovery
- Jest runs all `.test.js` and `.spec.js` files
- Exclude utility files with `testPathIgnorePatterns`
- Use `testMatch` to control test file patterns

## Future Enhancements

### Planned Improvements
1. **Integration Tests**: Add full API integration tests with test database
2. **Controller Tests**: Increase coverage of controller logic
3. **Service Layer Tests**: Test business logic in service files
4. **E2E Tests**: Add end-to-end tests for complete user flows
5. **Performance Tests**: Add load testing for API endpoints
6. **Mock Database**: Implement MongoDB Memory Server for isolated tests

### Testing Goals
- Achieve 80%+ code coverage
- Add integration tests for all API endpoints
- Implement continuous testing in CI/CD
- Add performance benchmarks

## Conclusion

The backend test suite provides solid coverage of critical components including models, routes, middleware, and utilities. With 59 tests and 100% pass rate, the codebase has a strong foundation for reliable API development. Future work will focus on increasing coverage of controllers, services, and adding integration tests.

## Related Documentation
- [Frontend Testing Documentation](../frontend/TESTING.md)
- [API Documentation](./README.md)
- [Database Schema](./config/README.md)
