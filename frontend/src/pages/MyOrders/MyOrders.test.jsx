import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MyOrders from './MyOrders';
import { StoreContext } from '../../components/context/StoreContext';
import axios from 'axios';

vi.mock('axios');
vi.mock('../../assets/assets.js', () => ({
  assets: {
    parcel_icon: 'parcel.png'
  }
}));

describe('MyOrders Component', () => {
  const mockToken = 'test-token';
  const mockOrders = [
    {
      _id: '1',
      items: [{ name: 'Pizza', quantity: 2 }],
      amount: 30,
      status: 'Food Processing'
    },
    {
      _id: '2',
      items: [{ name: 'Burger', quantity: 1 }],
      amount: 15,
      status: 'Delivered'
    }
  ];

  const mockContextValue = {
    url: 'http://localhost:4000',
    token: mockToken
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render my orders heading', () => {
    axios.post.mockResolvedValueOnce({ data: { data: [] } });
    
    render(
      <StoreContext.Provider value={mockContextValue}>
        <MyOrders />
      </StoreContext.Provider>
    );
    
    expect(screen.getByText(/my orders/i)).toBeInTheDocument();
  });

  it('should fetch orders on mount', async () => {
    axios.post.mockResolvedValueOnce({ data: { data: mockOrders } });
    
    render(
      <StoreContext.Provider value={mockContextValue}>
        <MyOrders />
      </StoreContext.Provider>
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/order/userorders'),
        {},
        expect.objectContaining({ headers: { token: mockToken } })
      );
    });
  });

  it('should display orders after fetching', async () => {
    axios.post.mockResolvedValueOnce({ data: { data: mockOrders } });
    
    render(
      <StoreContext.Provider value={mockContextValue}>
        <MyOrders />
      </StoreContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/pizza/i)).toBeInTheDocument();
    });
  });

  it('should display order status', async () => {
    axios.post.mockResolvedValueOnce({ data: { data: mockOrders } });
    
    render(
      <StoreContext.Provider value={mockContextValue}>
        <MyOrders />
      </StoreContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/food processing/i)).toBeInTheDocument();
    });
  });

  it('should render track order button', async () => {
    axios.post.mockResolvedValueOnce({ data: { data: mockOrders } });
    
    render(
      <StoreContext.Provider value={mockContextValue}>
        <MyOrders />
      </StoreContext.Provider>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /track order/i });
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('should handle empty orders list', async () => {
    axios.post.mockResolvedValueOnce({ data: { data: [] } });
    
    const { container } = render(
      <StoreContext.Provider value={mockContextValue}>
        <MyOrders />
      </StoreContext.Provider>
    );

    await waitFor(() => {
      expect(container.querySelector('.my-orders')).toBeInTheDocument();
    });
  });
});
