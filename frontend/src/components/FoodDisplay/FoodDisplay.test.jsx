import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FoodDisplay from './FoodDisplay';
import { StoreContext } from '../context/StoreContext';

vi.mock('../FoodItem/FoodItem', () => ({
  default: ({ name }) => <div data-testid="food-item">{name}</div>
}));

describe('FoodDisplay Component', () => {
  const mockFoodList = [
    { _id: '1', name: 'Pizza', category: 'Pizza', price: 12 },
    { _id: '2', name: 'Burger', category: 'Burger', price: 8 },
    { _id: '3', name: 'Salad', category: 'Salad', price: 6 }
  ];

  const mockContextValue = {
    food_list: mockFoodList
  };

  const renderFoodDisplay = (category = 'All', price = 100, name = '') => {
    return render(
      <BrowserRouter>
        <StoreContext.Provider value={mockContextValue}>
          <FoodDisplay category={category} price={price} name={name} />
        </StoreContext.Provider>
      </BrowserRouter>
    );
  };

  it('should render top dishes heading', () => {
    renderFoodDisplay();
    
    expect(screen.getByText(/top dishes near you/i)).toBeInTheDocument();
  });

  it('should render all food items when category is All', () => {
    renderFoodDisplay('All');
    
    const foodItems = screen.getAllByTestId('food-item');
    expect(foodItems).toHaveLength(3);
  });

  it('should filter food items by category', () => {
    renderFoodDisplay('Pizza');
    
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.queryByText('Burger')).not.toBeInTheDocument();
  });

  it('should render food display list container', () => {
    const { container } = renderFoodDisplay();
    
    expect(container.querySelector('.food-display-list')).toBeInTheDocument();
  });

  it('should handle empty food list', () => {
    const emptyContext = { food_list: [] };
    
    render(
      <BrowserRouter>
        <StoreContext.Provider value={emptyContext}>
          <FoodDisplay category="All" price={100} name="" />
        </StoreContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.queryByTestId('food-item')).not.toBeInTheDocument();
  });

  it('should show only matching category items', () => {
    renderFoodDisplay('Salad');
    
    const foodItems = screen.getAllByTestId('food-item');
    expect(foodItems).toHaveLength(1);
    expect(screen.getByText('Salad')).toBeInTheDocument();
  });
});
