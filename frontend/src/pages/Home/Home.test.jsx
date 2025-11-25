import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Home from './Home';
import { StoreContext } from '../../components/context/StoreContext';

vi.mock('axios');

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

vi.mock('../../components/Filter/Filter', () => ({
  default: ({ setPriceRange, setSearchTerm }) => (
    <div data-testid="filter">
      <button onClick={() => setPriceRange(100)}>Set Price</button>
      <button onClick={() => setSearchTerm('pho')}>Set Search</button>
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
  const mockRestaurants = [
    {
      _id: 'rest-1',
      name: 'Sài Gòn Bites',
      address: '123 Food Street',
      phone: '0909 123 456'
    }
  ];

  const renderHome = (overrides = {}) => {
    const contextValue = {
      url: 'http://localhost:4000',
      setSelectedRestaurant: vi.fn(),
      ...overrides
    };

    return {
      contextValue,
      ...render(
        <BrowserRouter>
          <StoreContext.Provider value={contextValue}>
            <Home />
          </StoreContext.Provider>
        </BrowserRouter>
      )
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: { success: true, data: mockRestaurants } });
  });

  it('shows restaurant selector after loading completes', async () => {
    renderHome();

    expect(screen.getByText(/Loading restaurants/i)).toBeInTheDocument();

    expect(await screen.findByText('Choose Your Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Sài Gòn Bites')).toBeInTheDocument();
    expect(screen.getByTestId('app-download')).toBeInTheDocument();
    expect(screen.queryByTestId('explore-menu')).not.toBeInTheDocument();
  });

  it('allows selecting a restaurant and renders the menu layout', async () => {
    const { contextValue } = renderHome();

    const restaurantCard = await screen.findByText('Sài Gòn Bites');
    fireEvent.click(restaurantCard);

    await waitFor(() => {
      expect(screen.getByText(/Back to Restaurants/)).toBeInTheDocument();
    });

    expect(screen.getByText('🏪 Sài Gòn Bites')).toBeInTheDocument();
    expect(screen.getByTestId('explore-menu')).toBeInTheDocument();
    expect(screen.getByTestId('filter')).toBeInTheDocument();
    expect(screen.getByTestId('food-display')).toBeInTheDocument();
    expect(contextValue.setSelectedRestaurant).toHaveBeenCalledWith(mockRestaurants[0]);
  });
});
