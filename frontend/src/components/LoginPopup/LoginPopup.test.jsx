import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPopup from './LoginPopup';
import { StoreContext } from '../context/StoreContext';
import axios from 'axios';

vi.mock('axios');
vi.mock('../../assets/assets.js', () => ({
  assets: {
    cross_icon: 'cross.png'
  }
}));

describe('LoginPopup Component', () => {
  const mockSetShowLogin = vi.fn();
  const mockSetToken = vi.fn();

  const mockContextValue = {
    url: 'http://localhost:4000',
    setToken: mockSetToken
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginPopup = () => {
    return render(
      <StoreContext.Provider value={mockContextValue}>
        <LoginPopup setShowLogin={mockSetShowLogin} />
      </StoreContext.Provider>
    );
  };

  it('should render login popup', () => {
    const { container } = renderLoginPopup();
    expect(container.querySelector('.login-popup')).toBeInTheDocument();
  });

  it('should close popup when cross icon is clicked', () => {
    renderLoginPopup();
    const crossIcon = screen.getByAltText('');
    fireEvent.click(crossIcon);
    expect(mockSetShowLogin).toHaveBeenCalledWith(false);
  });

  it('should render email and password fields', () => {
    renderLoginPopup();
    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('should render submit button', () => {
    renderLoginPopup();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should toggle terms and conditions checkbox', () => {
    renderLoginPopup();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
