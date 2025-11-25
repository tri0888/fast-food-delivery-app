import React, { useEffect, useState } from 'react';
import './ListRestaurant.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ListRestaurant = ({ url }) => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [permissions, setPermissions] = useState(null);
  const role = sessionStorage.getItem('role');

  const fetchRestaurants = async () => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await axios.get(`${url}/api/restaurant/list`, { headers: { token } });
      if (response.data.success) {
        setRestaurants(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch restaurants');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch restaurants');
    }
  };

  const fetchPermissions = async () => {
    const token = sessionStorage.getItem('token');
    if (role === 'admin' || role === 'superadmin') {
      try {
        const response = await axios.get(`${url}/api/restaurant/permissions`, { headers: { token } });
        if (response.data.success) {
          setPermissions(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch permissions');
      }
    }
  };

  useEffect(() => { 
    fetchRestaurants();
    fetchPermissions();
  }, []);

  const handleEdit = (e, restaurantId) => {
    e.preventDefault();
    if (role === 'superadmin' || permissions?.restaurant?.edit_restaurant) {
      navigate(`/restaurants/edit/${restaurantId}`);
    } else {
      toast.error('Permission "restaurant.edit_restaurant" is disabled for your restaurant');
    }
  };

  const handleManagePermissions = (restaurantId) => {
    navigate(`/restaurants/${restaurantId}/permissions`);
  };

  return (
    <div className='superadmin list flex-col'>
      <div className='superadmin-header'>
        <p>Restaurant Management</p>
        {role === 'superadmin' && (
          <button className='add-restaurant-btn' onClick={() => navigate('/restaurants/add')}>➕ Add Restaurant</button>
        )}
      </div>

      <div className='restaurants-table'>
        <div className='restaurants-table-format title'>
          <b>Name</b><b>Address</b><b>Phone</b><b>Actions</b>
        </div>
        {restaurants.length === 0 ? (
          <div className='no-data'><p>No restaurants found{role === 'superadmin' ? '. Add your first restaurant!' : '.'}</p></div>
        ) : (
          restaurants.map((restaurant) => (
            <div key={restaurant._id} className='restaurants-table-format'>
              <p>{restaurant.name}</p>
              <p>{restaurant.address}</p>
              <p>{restaurant.phone}</p>
              <div className='restaurant-actions'>
                <a href={`/restaurants/edit/${restaurant._id}`} onClick={(e) => handleEdit(e, restaurant._id)} className='cursor edit-link' style={{marginRight:10}}>Edit</a>
                {role === 'superadmin' && (
                  <button onClick={() => handleManagePermissions(restaurant._id)} className='manage-btn'>⚙️ Manage Permissions</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListRestaurant;
