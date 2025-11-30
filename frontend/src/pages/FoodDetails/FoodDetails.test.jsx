import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FoodDetails from './FoodDetails';
import { StoreContext } from '../../components/context/StoreContext';
import axios from 'axios';

vi.mock('axios');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn()
  };
});

describe('FoodDetails Component', () => {
  const mockFoodItem = {
    _id: '1',
    name: 'Delicious Pizza',
    description: 'A tasty pizza with fresh ingredients',
    price: 15,
    image: 'pizza.jpg',
    category: 'Pizza',
    stock: 10
  };

  const mockContextValue = {
    url: 'http://localhost:4000',
    food_list: [mockFoodItem],
    cartItems: {},
    addToCart: vi.fn(),
    removeFromCart: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render food details page', () => {
    const { container } = render(
      <BrowserRouter>
        <StoreContext.Provider value={mockContextValue}>
          <FoodDetails />
        </StoreContext.Provider>
      </BrowserRouter>
    );
    
    expect(container.querySelector('.food-details')).toBeInTheDocument();
  });

  it('should display food name', async () => {
    render(
      <BrowserRouter>
        <StoreContext.Provider value={mockContextValue}>
          <FoodDetails />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/delicious pizza/i)).toBeInTheDocument();
    });
  });

  it('should display food description', async () => {
    render(
      <BrowserRouter>
        <StoreContext.Provider value={mockContextValue}>
          <FoodDetails />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/tasty pizza/i)).toBeInTheDocument();
    });
  });

  it('should display food price', async () => {
    render(
      <BrowserRouter>
        <StoreContext.Provider value={mockContextValue}>
          <FoodDetails />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/\$15/)).toBeInTheDocument();
    });
  });

  it('should display food category', async () => {
    const { container } = render(
      <BrowserRouter>
        <StoreContext.Provider value={mockContextValue}>
          <FoodDetails />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const category = container.querySelector('.food-details-category');
      expect(category).toBeInTheDocument();
    });
  });

  it('should show stock information', async () => {
    render(
      <BrowserRouter>
        <StoreContext.Provider value={mockContextValue}>
          <FoodDetails />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/10/)).toBeInTheDocument();
    });
  });

  it('should render add to cart button', async () => {
    render(
      <BrowserRouter>
        <StoreContext.Provider value={mockContextValue}>
          <FoodDetails />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it('should handle missing food item', async () => {
    const emptyContext = {
      ...mockContextValue,
      food_list: []
    };

    const { container } = render(
      <BrowserRouter>
        <StoreContext.Provider value={emptyContext}>
          <FoodDetails />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    // Check if component renders even with empty list
    expect(container.firstChild).toBeTruthy();
  });
});
