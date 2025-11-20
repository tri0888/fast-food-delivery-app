import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header Component', () => {
  it('should render header component', () => {
    const { container } = render(<Header />);
    
    expect(container.querySelector('.header')).toBeInTheDocument();
  });

  it('should render header content', () => {
    const { container } = render(<Header />);
    
    expect(container.querySelector('.header-contents')).toBeInTheDocument();
  });

  it('should display main heading text', () => {
    render(<Header />);
    
    // Check for common header text patterns
    const header = screen.getByRole('heading', { level: 2 });
    expect(header).toBeInTheDocument();
  });

  it('should render view menu button', () => {
    render(<Header />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should have correct button text', () => {
    render(<Header />);
    
    expect(screen.getByText(/view menu/i)).toBeInTheDocument();
  });
});
