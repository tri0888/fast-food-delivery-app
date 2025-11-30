import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

vi.mock('../../assets/assets.js', () => ({
  assets: {
    logo: 'logo.png',
    facebook_icon: 'facebook.png',
    twitter_icon: 'twitter.png',
    linkedin_icon: 'linkedin.png'
  }
}));

describe('Footer Component', () => {
  it('should render footer with logo', () => {
    render(<Footer />);
    
    const images = screen.getAllByAltText('');
    expect(images.length).toBeGreaterThan(0);
  });

  it('should render company information section', () => {
    render(<Footer />);
    
    expect(screen.getByText(/company/i)).toBeInTheDocument();
  });

  it('should render social media icons', () => {
    const { container } = render(<Footer />);
    
    const socialIcons = container.querySelectorAll('.footer-social-icons img');
    expect(socialIcons.length).toBeGreaterThan(0);
  });

  it('should render get in touch section', () => {
    render(<Footer />);
    
    expect(screen.getByText(/get in touch/i)).toBeInTheDocument();
  });

  it('should render copyright text', () => {
    render(<Footer />);
    
    expect(screen.getByText(/copyright/i)).toBeInTheDocument();
  });

  it('should have footer-content class', () => {
    const { container } = render(<Footer />);
    
    expect(container.querySelector('.footer-content')).toBeInTheDocument();
  });
});
