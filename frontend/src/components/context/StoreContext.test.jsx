import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import StoreContextProvider, { StoreContext } from './StoreContext';

// Mock axios
vi.mock('axios');

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

describe('StoreContext', () => {
  const mockFoodList = [
    { _id: '1', name: 'Pizza', price: 10, stock: 5 },
    { _id: '2', name: 'Burger', price: 8, stock: 3 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide initial context values', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: mockFoodList } });

    const { result } = renderHook(() => {
      const context = React.useContext(StoreContext);
      return context;
    }, {
      wrapper: ({ children }) => <StoreContextProvider>{children}</StoreContextProvider>
    });

    await waitFor(() => {
      expect(result.current.food_list).toEqual(mockFoodList);
    });

    expect(result.current.cartItems).toEqual({});
    expect(result.current.token).toBe('');
    expect(result.current.lockedRestaurants).toEqual({});
    expect(result.current.isRestaurantLocked('random')).toBe(false);
  });

  it('should fetch food list on mount', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: mockFoodList } });

    const { result } = renderHook(() => {
      const context = React.useContext(StoreContext);
      return context;
    }, {
      wrapper: ({ children }) => <StoreContextProvider>{children}</StoreContextProvider>
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/food/list'));
      expect(result.current.food_list).toHaveLength(2);
    });
  });

  it('should calculate total cart amount correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: mockFoodList } });

    const { result } = renderHook(() => {
      const context = React.useContext(StoreContext);
      return context;
    }, {
      wrapper: ({ children }) => <StoreContextProvider>{children}</StoreContextProvider>
    });

    await waitFor(() => {
      expect(result.current.food_list).toHaveLength(2);
    });

    // Manually set cart items
    result.current.setCartItems({ '1': 2, '2': 1 });

    await waitFor(() => {
      const total = result.current.getTotalCartAmount();
      expect(total).toBe(28); // 2 * 10 + 1 * 8 = 28
    });
  });

  it('should handle empty food list gracefully', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [] } });

    const { result } = renderHook(() => {
      const context = React.useContext(StoreContext);
      return context;
    }, {
      wrapper: ({ children }) => <StoreContextProvider>{children}</StoreContextProvider>
    });

    await waitFor(() => {
      expect(result.current.food_list).toEqual([]);
    });
  });

  it('should handle API errors when fetching food list', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => {
      const context = React.useContext(StoreContext);
      return context;
    }, {
      wrapper: ({ children }) => <StoreContextProvider>{children}</StoreContextProvider>
    });

    await waitFor(() => {
      expect(result.current.food_list).toEqual([]);
    });
  });
});
