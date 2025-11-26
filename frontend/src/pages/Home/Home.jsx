import React, { useState, useContext, useEffect } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import Filter from '../../components/Filter/Filter'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import { StoreContext } from '../../components/context/StoreContext'
import axios from 'axios'

const Home = () => {
  const [category, setCategory] = useState('All')
  const [priceRange, setPriceRange] = useState(200); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { url, setSelectedRestaurant: setGlobalRestaurant } = useContext(StoreContext);

  const restaurantIcons = ['🍔', '🍕', '🍗', '🌮', '🍜', '🍱', '🥘', '🍝'];

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${url}/api/restaurant/public/list`);
      if (response.data.success) {
        setRestaurants(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setGlobalRestaurant(restaurant);
    localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
  };

  if (loading) {
    return (
      <div>
        <Header/>
        <div style={{textAlign: 'center', padding: '2rem'}}>
          <p>Loading restaurants...</p>
        </div>
      </div>
    );
  }

  // If no restaurant selected, show restaurant cards
  if (!selectedRestaurant) {
    return (
      <div>
        <Header/>
        <div className='restaurant-selection'>
          <h2>Choose Your Restaurant</h2>
          <p>Select a restaurant to explore their menu</p>
          <div className='food-display' id='food-display'>
            <div className='food-display-list'>
              {restaurants.map((restaurant, index) => (
                <div 
                  key={restaurant._id} 
                  className='food-item'
                  onClick={() => handleRestaurantSelect(restaurant)}
                  style={{cursor: 'pointer'}}
                >
                  <div className='food-item-img-container'>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '4rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}>
                      {restaurantIcons[index % restaurantIcons.length]}
                    </div>
                  </div>
                  <div className='food-item-info'>
                    <div className='food-item-name-rating'>
                      <p style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{restaurant.name}</p>
                    </div>
                    <p className='food-item-desc'>📍 {restaurant.address}</p>
                    <p className='food-item-price'>📞 {restaurant.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <AppDownload/>
      </div>
    );
  }

  // If restaurant selected, show food menu
  return (
    <div>
      <Header/>
      <div style={{padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>🏪 {selectedRestaurant.name}</h2>
        <button 
          onClick={() => setSelectedRestaurant(null)}
          style={{
            padding: '0.5rem 1rem',
            background: '#ff6347',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← Back to Restaurants
        </button>
      </div>
      <ExploreMenu category={category} setCategory={setCategory}/>
      <div className="home-content">
        <div className="home-sidebar">
          <Filter 
            priceRange={priceRange}
            searchTerm={searchTerm}
            setPriceRange = {setPriceRange}
            setSearchTerm = {setSearchTerm}
          />
        </div>
        <div className="home-main">
          <FoodDisplay 
            category={category}
            price={priceRange}
            name={searchTerm}/>
        </div>
      </div>
      <AppDownload/>
    </div>
  )
}

export default Home