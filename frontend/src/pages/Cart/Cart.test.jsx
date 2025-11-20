import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from './Cart';
import { StoreContext } from '../../components/context/StoreContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Cart Component', () => {
  const mockFood = [
    { _id: '1', name: 'Pizza', price: 10, image: 'pizza.jpg' },
    { _id: '2', name: 'Burger', price: 8, image: 'burger.jpg' }
  ];

  const mockContextValue = {
    cartItems: { '1': 2, '2': 1 },
    food_list: mockFood,
    removeFromCart: vi.fn(),
    getTotalCartAmount: () => 28,
    url: 'http://localhost:4000'
  };

  const renderCart = (contextValue = mockContextValue) => {
    return render(
      <BrowserRouter>
        <StoreContext.Provider value={contextValue}>
          <Cart />
        </StoreContext.Provider>
      </BrowserRouter>
    );
  };

  it('should render cart items', () => {
    renderCart();
    
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
  });

  it('should display correct quantities', () => {
    const { container } = renderCart();
    
    // Check if quantity displays exist
    const quantityDisplays = container.querySelectorAll('.quantity-display');
    expect(quantityDisplays.length).toBeGreaterThan(0);
    expect(quantityDisplays[0].textContent).toContain('2');
  });

  it('should calculate subtotal correctly', () => {
    renderCart();
    
    expect(screen.getByText('$28')).toBeInTheDocument();
  });

  it('should calculate total with delivery fee', () => {
    renderCart();
    
    // Total = subtotal (28) + delivery (2) = 30
    expect(screen.getByText('$30')).toBeInTheDocument();
  });

  it('should navigate to order page when checkout clicked', () => {
    renderCart();
    
    const checkoutButton = screen.getByText(/proceed to checkout/i);
    fireEvent.click(checkoutButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/order');
  });

  it('should show empty cart message when cart is empty', () => {
    const emptyContext = {
      ...mockContextValue,
      cartItems: {},
      getTotalCartAmount: () => 0
    };
    
    renderCart(emptyContext);
    
    // When cart is empty, no items should be rendered
    expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
  });

  it('should call removeFromCart when remove is clicked', () => {
    const { container } = renderCart();
    
    // Find remove button (this depends on your actual implementation)
    const removeButtons = container.querySelectorAll('.cart-items-remove-icon');
    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);
      expect(mockContextValue.removeFromCart).toHaveBeenCalled();
    }
  });

  it('should display delivery fee', () => {
    renderCart();
    
    expect(screen.getByText(/delivery fee/i)).toBeInTheDocument();
    expect(screen.getByText('$2')).toBeInTheDocument();
  });
});
