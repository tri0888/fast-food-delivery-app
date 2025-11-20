import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PlaceOrder from './PlaceOrder';
import { StoreContext } from '../../components/context/StoreContext';
import axios from 'axios';

vi.mock('axios');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('PlaceOrder Component', () => {
  const mockFoodList = [
    { _id: '1', name: 'Pizza', price: 10 },
    { _id: '2', name: 'Burger', price: 8 }
  ];

  const mockContextValue = {
    getTotalCartAmount: () => 28,
    token: 'test-token',
    food_list: mockFoodList,
    cartItems: { '1': 2, '2': 1 },
    url: 'http://localhost:4000'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPlaceOrder = (contextValue = mockContextValue) => {
    return render(
      <BrowserRouter>
        <StoreContext.Provider value={contextValue}>
          <PlaceOrder />
        </StoreContext.Provider>
      </BrowserRouter>
    );
  };

  it('should render delivery information form', () => {
    renderPlaceOrder();
    
    expect(screen.getByText(/delivery information/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  it('should render cart totals', () => {
    renderPlaceOrder();
    expect(screen.getByText(/cart total/i)).toBeInTheDocument();
    expect(screen.getByText('$28')).toBeInTheDocument();
  });

  it('should calculate delivery fee', () => {
    renderPlaceOrder();
    
    expect(screen.getByText(/delivery fee/i)).toBeInTheDocument();
    expect(screen.getByText('$2')).toBeInTheDocument();
  });

  it('should calculate total amount', () => {
    renderPlaceOrder();
    
    // Total = 28 + 2 = 30
    expect(screen.getByText('$30')).toBeInTheDocument();
  });

  it('should render proceed to payment button', () => {
    renderPlaceOrder();
    
    expect(screen.getByText(/proceed to payment/i)).toBeInTheDocument();
  });

  it('should handle form input changes', () => {
    renderPlaceOrder();
    const firstNameInput = screen.getByPlaceholderText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    expect(firstNameInput.value).toBe('John');
  });

  it('should redirect if cart is empty', () => {
    const emptyCartContext = {
      ...mockContextValue,
      getTotalCartAmount: () => 0
    };

    renderPlaceOrder(emptyCartContext);

    // Should show empty cart or redirect
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('should show delivery address fields', () => {
    renderPlaceOrder();
    
    expect(screen.getByPlaceholderText(/street/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/city/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/state/i)).toBeInTheDocument();
  });
});
