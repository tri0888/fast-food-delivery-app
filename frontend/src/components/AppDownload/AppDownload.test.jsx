import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppDownload from './AppDownload';

vi.mock('../../assets/assets.js', () => ({
  assets: {
    play_store: 'playstore.png',
    app_store: 'appstore.png'
  }
}));

describe('AppDownload Component', () => {
  it('should render app download section', () => {
    const { container } = render(<AppDownload />);
    
    expect(container.querySelector('.app-download')).toBeInTheDocument();
  });

  it('should render download heading', () => {
    render(<AppDownload />);

    expect(screen.getByText(/for better experience/i)).toBeInTheDocument();
  });  it('should render app name in heading', () => {
    render(<AppDownload />);
    
    expect(screen.getByText(/tomato app/i)).toBeInTheDocument();
  });

  it('should render play store image', () => {
    const { container } = render(<AppDownload />);
    
    const images = container.querySelectorAll('.app-download-platforms img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('should render app store image', () => {
    const { container } = render(<AppDownload />);
    
    const images = container.querySelectorAll('.app-download-platforms img');
    expect(images.length).toBe(2);
  });

  it('should have correct structure', () => {
    const { container } = render(<AppDownload />);
    
    expect(container.querySelector('.app-download-platforms')).toBeInTheDocument();
  });
});
