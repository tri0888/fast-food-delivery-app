import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Verify from './Verify';
import { StoreContext } from '../../components/context/StoreContext';
import axios from 'axios';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

const mockNavigate = vi.fn();
const mockSearchParams = '?success=true&orderId=123&session_id=session-456';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(mockSearchParams)]
  };
});

describe('Verify Component', () => {
  const mockContextValue = {
    url: 'http://localhost:4000'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  it('should render verify page', () => {
    const { container } = render(
      <BrowserRouter>
        <StoreContext.Provider value={mockContextValue}>
          <Verify />
        </StoreContext.Provider>
      </BrowserRouter>
    );
    
    expect(container.querySelector('.verify')).toBeInTheDocument();
  });

  it('should show spinner during verification', () => {
    const { container } = render(
      <BrowserRouter>
        <StoreContext.Provider value={mockContextValue}>
          <Verify />
        </StoreContext.Provider>
      </BrowserRouter>
    );
    
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  it('should call API to verify payment', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    
    render(
      <BrowserRouter>
        <StoreContext.Provider value={mockContextValue}>
          <Verify />
        </StoreContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4000/api/order/verify',
        { success: 'true', sessionId: 'session-456', orderId: '123' }
      );
    }, { timeout: 3000 });
  });
});
