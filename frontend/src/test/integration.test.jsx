import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from '../App';
import StoreContextProvider from '../components/context/StoreContext';

// Mock axios
vi.mock('axios');

// Mock components to isolate integration test
vi.mock('../components/Navbar/Navbar', () => ({
  default: ({ setShowLogin }) => (
    <nav data-testid="navbar">
      <button onClick={() => setShowLogin(true)}>Sign In</button>
    </nav>
  )
}));

vi.mock('../components/Footer/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>
}));

vi.mock('../components/LoginPopup/LoginPopup', () => ({
  default: ({ setShowLogin }) => (
    <div data-testid="login-popup">
      <button onClick={() => setShowLogin(false)}>Close</button>
      <form data-testid="login-form">
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}));

vi.mock('../pages/Home/Home', () => ({
  default: () => <div data-testid="home-page">Home Page Content</div>
}));

describe('App Integration Tests', () => {
  const mockFoodData = [
    { _id: '1', name: 'Pizza', price: 12, category: 'Italian', stock: 10, image: 'pizza.jpg' },
    { _id: '2', name: 'Burger', price: 8, category: 'American', stock: 5, image: 'burger.jpg' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock food list API call
    axios.get.mockResolvedValue({
      data: { success: true, data: mockFoodData }
    });

    // Mock cart API call
    axios.post.mockResolvedValue({
      data: { success: true, message: 'Success' }
    });
  });

  it('should render complete application structure', async () => {
    render(
      <BrowserRouter>
        <StoreContextProvider>
          <App />
        </StoreContextProvider>
      </BrowserRouter>
    );

    // Check main structure
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();

    // Wait for food list to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/food/list')
      );
    });
  });

  it('should show login popup when sign in is clicked', async () => {
    render(
      <BrowserRouter>
        <StoreContextProvider>
          <App />
        </StoreContextProvider>
      </BrowserRouter>
    );

    // Initially no login popup
    expect(screen.queryByTestId('login-popup')).not.toBeInTheDocument();

    // Click sign in
    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    // Login popup should appear
    await waitFor(() => {
      expect(screen.getByTestId('login-popup')).toBeInTheDocument();
    });
  });

  it('should hide login popup when closed', async () => {
    render(
      <BrowserRouter>
        <StoreContextProvider>
          <App />
        </StoreContextProvider>
      </BrowserRouter>
    );

    // Open login popup
    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByTestId('login-popup')).toBeInTheDocument();
    });

    // Close popup
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('login-popup')).not.toBeInTheDocument();
    });
  });

  it('should load food list on mount', async () => {
    render(
      <BrowserRouter>
        <StoreContextProvider>
          <App />
        </StoreContextProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/food/list')
      );
    });
  });

  it('should load user data if token exists in localStorage', async () => {
    const mockToken = 'test-token-123';
    localStorage.setItem('token', mockToken);

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/food/list')) {
        return Promise.resolve({ data: { data: mockFoodData } });
      }
      if (url.includes('/api/cart/get')) {
        return Promise.resolve({ 
          data: { 
            cartData: { '1': 2 },
            isCartLocked: false 
          } 
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <BrowserRouter>
        <StoreContextProvider>
          <App />
        </StoreContextProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/cart/get'),
        expect.objectContaining({
          headers: expect.objectContaining({ token: mockToken })
        })
      );
    });
  });

  it('should render ToastContainer for notifications', () => {
    const { container } = render(
      <BrowserRouter>
        <StoreContextProvider>
          <App />
        </StoreContextProvider>
      </BrowserRouter>
    );

    expect(container.querySelector('.Toastify')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.get.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <StoreContextProvider>
          <App />
        </StoreContextProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // App should still render even with API errors
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
