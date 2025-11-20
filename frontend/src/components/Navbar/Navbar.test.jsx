import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { StoreContext } from '../context/StoreContext';

// Mock assets
vi.mock('../../assets/assets.js', () => ({
  assets: {
    logo: 'logo.png',
    basket_icon: 'basket.png',
    search_icon: 'search.png',
    profile_icon: 'profile.png',
    bag_icon: 'bag.png',
    logout_icon: 'logout.png'
  }
}));

describe('Navbar Component', () => {
  const mockSetShowLogin = vi.fn();
  const mockSetToken = vi.fn();

  const mockContextValue = {
    token: '',
    setToken: mockSetToken,
    getTotalCartAmount: () => 0,
    cartItems: {}
  };

  const renderNavbar = (contextValue = mockContextValue) => {
    return render(
      <BrowserRouter>
        <StoreContext.Provider value={contextValue}>
          <Navbar setShowLogin={mockSetShowLogin} />
        </StoreContext.Provider>
      </BrowserRouter>
    );
  };

  it('should render navigation links', () => {
    renderNavbar();
    
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/menu/i)).toBeInTheDocument();
    expect(screen.getByText(/mobile-app/i)).toBeInTheDocument();
    expect(screen.getByText(/contact us/i)).toBeInTheDocument();
  });

  it('should show sign in button when not logged in', () => {
    renderNavbar();
    
    const signInButton = screen.getByText(/sign in/i);
    expect(signInButton).toBeInTheDocument();
  });

  it('should call setShowLogin when sign in button is clicked', () => {
    renderNavbar();
    
    const signInButton = screen.getByText(/sign in/i);
    fireEvent.click(signInButton);
    
    expect(mockSetShowLogin).toHaveBeenCalledWith(true);
  });

  it('should show profile icon when logged in', () => {
    const loggedInContext = {
      ...mockContextValue,
      token: 'test-token'
    };
    
    const { container } = renderNavbar(loggedInContext);
    
    // Check for navbar-profile div which indicates logged in state
    const profileDiv = container.querySelector('.navbar-profile');
    expect(profileDiv).toBeInTheDocument();
  });

  it('should render cart with dot indicator when items exist', () => {
    const contextWithCartItems = {
      ...mockContextValue,
      getTotalCartAmount: () => 30,
      cartItems: { '1': 2 }
    };
    
    const { container } = renderNavbar(contextWithCartItems);
    
    // Check for dot indicator when cart has items
    const dot = container.querySelector('.dot');
    expect(dot).toBeInTheDocument();
  });

  it('should logout user when logout is clicked', () => {
    const loggedInContext = {
      ...mockContextValue,
      token: 'test-token'
    };
    
    const { container } = renderNavbar(loggedInContext);
    
    // Check that logout option exists in dropdown
    const logoutText = screen.getByText(/logout/i);
    expect(logoutText).toBeInTheDocument();
    
    // Click logout
    fireEvent.click(logoutText);
    
    // Verify setToken was called (actual implementation may vary)
    expect(mockSetToken).toHaveBeenCalled();
  });
});
