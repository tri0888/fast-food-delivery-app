import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StoreContextProvider from '../components/context/StoreContext';

/**
 * Custom render function that includes common providers
 */
export function renderWithProviders(ui, options = {}) {
  const { initialState, ...renderOptions } = options;

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <StoreContextProvider>
          {children}
        </StoreContextProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock context value helper
 */
export function createMockContext(overrides = {}) {
  return {
    cartItems: {},
    food_list: [],
    token: '',
    lockedRestaurants: {},
    isRestaurantLocked: () => false,
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    getTotalCartAmount: () => 0,
    setCartItems: vi.fn(),
    setToken: vi.fn(),
    url: 'http://localhost:4000',
    ...overrides
  };
}

/**
 * Mock food item helper
 */
export function createMockFood(overrides = {}) {
  return {
    _id: Math.random().toString(36).substr(2, 9),
    name: 'Test Food',
    price: 10,
    description: 'Test description',
    category: 'Test Category',
    image: 'test.jpg',
    stock: 5,
    ...overrides
  };
}

/**
 * Wait for async operations
 */
export function waitForLoadingToFinish() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
}

/**
 * Mock axios response
 */
export function createMockAxiosResponse(data, config = {}) {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
    ...config
  };
}
