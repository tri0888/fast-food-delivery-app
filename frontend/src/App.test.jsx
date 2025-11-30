import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import StoreContextProvider from './components/context/StoreContext';

// Mock child components
vi.mock('./components/Navbar/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('./components/Footer/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('./components/LoginPopup/LoginPopup', () => ({
  default: () => <div data-testid="login-popup">Login Popup</div>
}));

vi.mock('./pages/Home/Home', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}));

describe('App Component', () => {
  it('should render navbar and footer', () => {
    render(
      <BrowserRouter>
        <StoreContextProvider>
          <App />
        </StoreContextProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render home page by default', () => {
    render(
      <BrowserRouter>
        <StoreContextProvider>
          <App />
        </StoreContextProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('should render ToastContainer', () => {
    const { container } = render(
      <BrowserRouter>
        <StoreContextProvider>
          <App />
        </StoreContextProvider>
      </BrowserRouter>
    );

    // ToastContainer is rendered in the DOM
    expect(container.querySelector('.Toastify')).toBeInTheDocument();
  });
});
