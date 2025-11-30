# Frontend Testing Documentation

## Overview
This project uses **Vitest** and **React Testing Library** for comprehensive frontend testing.

## Test Structure

### Test Files
- `App.test.jsx` - Main application component tests
- `components/context/StoreContext.test.jsx` - Context and state management tests
- `components/Navbar/Navbar.test.jsx` - Navigation component tests
- `components/FoodItem/FoodItem.test.jsx` - Food item component tests
- `pages/Home/Home.test.jsx` - Home page tests
- `pages/Cart/Cart.test.jsx` - Shopping cart tests

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## Test Coverage

The test suite covers:
- ✅ Component rendering
- ✅ User interactions (clicks, form inputs)
- ✅ Context state management
- ✅ API mocking
- ✅ Navigation and routing
- ✅ Cart functionality
- ✅ Authentication flows
- ✅ Error handling

## Writing Tests

### Basic Test Structure
```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing with Context
```javascript
import { StoreContext } from '../context/StoreContext';

const mockContextValue = {
  cartItems: {},
  addToCart: vi.fn()
};

render(
  <StoreContext.Provider value={mockContextValue}>
    <MyComponent />
  </StoreContext.Provider>
);
```

### Testing User Interactions
```javascript
import { fireEvent } from '@testing-library/react';

const button = screen.getByText('Click me');
fireEvent.click(button);
expect(mockFunction).toHaveBeenCalled();
```

### Mocking API Calls
```javascript
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

axios.get.mockResolvedValueOnce({ 
  data: { success: true, data: [] } 
});
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Test user behavior**: Focus on what users see/do
3. **Mock external dependencies**: APIs, modules, etc.
4. **Use semantic queries**: `getByRole`, `getByText`, etc.
5. **Clean up**: Tests are isolated and don't affect each other
6. **Coverage targets**: Aim for >80% coverage on critical paths

## CI/CD Integration

Tests run automatically on:
- Every push to repository
- Pull requests
- Before deployment

See `.github/workflows/node.js.yml` for CI/CD configuration.

## Troubleshooting

### Tests not running?
- Check Node.js version (v16+)
- Run `npm install` to ensure all dependencies installed
- Clear cache: `npm run test -- --clearCache`

### Import errors?
- Check mock paths match actual file structure
- Verify `vite.config.js` has correct test configuration

### Coverage not generating?
- Run `npm run test:coverage`
- Check `coverage/` directory for reports
- Open `coverage/index.html` in browser for visual report
