import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import { StoreContext } from '../../components/context/StoreContext';

// Mock child components
vi.mock('../../components/Header/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('../../components/ExploreMenu/ExploreMenu', () => ({
  default: ({ category, setCategory }) => (
    <div data-testid="explore-menu">
      <span>Category: {category}</span>
      <button onClick={() => setCategory('Pizza')}>Set Pizza</button>
    </div>
  )
}));

vi.mock('../../components/FoodDisplay/FoodDisplay', () => ({
  default: ({ category }) => (
    <div data-testid="food-display">FoodDisplay - {category}</div>
  )
}));

vi.mock('../../components/AppDownload/AppDownload', () => ({
  default: () => <div data-testid="app-download">AppDownload</div>
}));

describe('Home Component', () => {
  const mockContextValue = {
    food_list: [
      { _id: '1', name: 'Pizza', price: 10, category: 'Pizza' },
      { _id: '2', name: 'Burger', price: 8, category: 'Burger' }
    ]
  };

  const renderHome = (contextValue = mockContextValue) => {
    return render(
      <BrowserRouter>
        <StoreContext.Provider value={contextValue}>
          <Home />
        </StoreContext.Provider>
      </BrowserRouter>
    );
  };

  it('should render all main sections', () => {
    renderHome();
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('explore-menu')).toBeInTheDocument();
    expect(screen.getByTestId('food-display')).toBeInTheDocument();
    expect(screen.getByTestId('app-download')).toBeInTheDocument();
  });

  it('should initialize with "All" category', () => {
    renderHome();
    
    expect(screen.getByText(/Category: All/i)).toBeInTheDocument();
  });

  it('should update category when changed', () => {
    renderHome();
    
    const setPizzaButton = screen.getByText('Set Pizza');
    fireEvent.click(setPizzaButton);
    
    // After clicking, verify FoodDisplay received the Pizza category
    expect(screen.getByText(/FoodDisplay - Pizza/i)).toBeInTheDocument();
  });

  it('should pass category to FoodDisplay', () => {
    renderHome();
    
    expect(screen.getByText(/FoodDisplay - All/i)).toBeInTheDocument();
  });
});
