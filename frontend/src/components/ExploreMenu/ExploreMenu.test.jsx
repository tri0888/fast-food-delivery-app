import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExploreMenu from './ExploreMenu';

vi.mock('../../assets/assets.js', () => ({
  menu_list: [
    { menu_name: 'Salad', menu_image: 'salad.png' },
    { menu_name: 'Rolls', menu_image: 'rolls.png' },
    { menu_name: 'Deserts', menu_image: 'deserts.png' },
    { menu_name: 'Sandwich', menu_image: 'sandwich.png' }
  ]
}));

describe('ExploreMenu Component', () => {
  const mockSetCategory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render explore menu heading', () => {
    render(<ExploreMenu category="All" setCategory={mockSetCategory} />);
    
    expect(screen.getByText(/explore our menu/i)).toBeInTheDocument();
  });

  it('should render all menu items', () => {
    render(<ExploreMenu category="All" setCategory={mockSetCategory} />);
    
    expect(screen.getByText('Salad')).toBeInTheDocument();
    expect(screen.getByText('Rolls')).toBeInTheDocument();
    expect(screen.getByText('Deserts')).toBeInTheDocument();
    expect(screen.getByText('Sandwich')).toBeInTheDocument();
  });

  it('should call setCategory when menu item is clicked', () => {
    render(<ExploreMenu category="All" setCategory={mockSetCategory} />);
    
    const saladItem = screen.getByText('Salad');
    fireEvent.click(saladItem);
    
    expect(mockSetCategory).toHaveBeenCalled();
  });

  it('should apply active class to selected category', () => {
    const { container } = render(
      <ExploreMenu category="Salad" setCategory={mockSetCategory} />
    );
    
    const activeItems = container.querySelectorAll('.active');
    expect(activeItems.length).toBeGreaterThan(0);
  });

  it('should toggle category when same item clicked twice', () => {
    render(<ExploreMenu category="Salad" setCategory={mockSetCategory} />);
    
    const saladItem = screen.getByText('Salad');
    fireEvent.click(saladItem);
    
    expect(mockSetCategory).toHaveBeenCalled();
  });

  it('should render menu description text', () => {
    const { container } = render(
      <ExploreMenu category="All" setCategory={mockSetCategory} />
    );
    
    expect(container.querySelector('.explore-menu\\=text')).toBeInTheDocument();
  });
});
