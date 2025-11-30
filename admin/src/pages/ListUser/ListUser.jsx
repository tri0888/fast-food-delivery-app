import React, { useEffect, useState } from 'react';
import './ListUser.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

const ListUser = ({url}) => {
  const navigate          = useNavigate();
  const role              = sessionStorage.getItem('role') || 'user';
  const storedRestaurantId = sessionStorage.getItem('restaurantId') || '';
  const [filterRestaurantId, setFilterRestaurantId] = useState(role === 'superadmin' ? '' : storedRestaurantId);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    action: '',
    restaurantId: '',
    restaurantName: ''
  });

    const activeRestaurantId = role === 'superadmin' ? filterRestaurantId : storedRestaurantId;

    const getRestaurantName = (restaurantId) => {
      if (!restaurantId) {
        return role === 'superadmin' ? 'selected restaurant' : 'your restaurant';
      }

      if (role === 'superadmin') {
        const restaurant = restaurants.find((item) => item._id === restaurantId);
        return restaurant?.name || 'selected restaurant';
      }

      return 'your restaurant';
    };

    const fetchUsers = async () => {
      const token = sessionStorage.getItem("token");
      const params = {};
      if (role === 'superadmin' && filterRestaurantId) {
        params.restaurantId = filterRestaurantId;
      } else if (role !== 'superadmin' && storedRestaurantId) {
        params.restaurantId = storedRestaurantId;
      }

      try {
        const config = { headers: { token } };
        if (Object.keys(params).length) {
          config.params = params;
        }

        const response = await axios.get(`${url}/api/user/list`, config);
        if(response.data.success) {
          const normalizedUsers = (response.data.data || []).map((user) => ({
            ...user,
            cartLocks: user.cartLocks || {}
          }));
          setUsers(normalizedUsers);
        } else {
          toast.error(response.data.message || "Failed to fetch users");
        }
      } catch (error) {
        console.log(error);
        const errorMessage = error.response?.data?.message || 'Failed to fetch users';
        toast.error(errorMessage);
      }
    }

    const fetchPermissions = async () => {
        const token = sessionStorage.getItem("token");
        const role = sessionStorage.getItem('role');
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

      const fetchRestaurants = async () => {
        if (role !== 'superadmin') {
          return;
        }
        const token = sessionStorage.getItem('token');
        try {
          const response = await axios.get(`${url}/api/restaurant/list`, { headers: { token } });
          if (response.data.success) {
            setRestaurants(response.data.data || []);
          }
        } catch (error) {
          console.error('Failed to fetch restaurants for filtering');
        }
      };

    const handleAddClick = () => {
        const role = sessionStorage.getItem('role');
        if (role === 'superadmin' || permissions?.users?.add_user) {
            navigate('/add-user');
        } else {
            toast.error('Permission "users.add_user" is disabled for your restaurant');
        }
    };

    const handleEditClick = (e, userId) => {
        e.preventDefault();
        const role = sessionStorage.getItem('role');
        if (role === 'superadmin' || permissions?.users?.edit_user) {
            navigate(`/edit-user/${userId}`);
        } else {
            toast.error('Permission "users.edit_user" is disabled for your restaurant');
        }
    };

      const handleRestaurantFilterChange = (event) => {
        setFilterRestaurantId(event.target.value);
      };

    const toggleCartLock = (user) => {
      if (!activeRestaurantId) {
        toast.error(role === 'superadmin' ? 'Please select a restaurant before toggling cart locks.' : 'Restaurant assignment missing for this admin.');
        return;
      }

      const lockedMap = user.cartLocks || {};
      const currentStatus = Boolean(lockedMap[activeRestaurantId]);
      const action = currentStatus ? 'Unlock Cart' : 'Lock Cart';
        
      setConfirmDialog({
        isOpen: true,
        userId: user._id,
        userName: user.name,
        action,
        restaurantId: activeRestaurantId,
        restaurantName: getRestaurantName(activeRestaurantId)
      });
    };

    const handleConfirmToggleLock = async () => {
      const { userId, restaurantId } = confirmDialog;
      if (!restaurantId) {
        toast.error('Restaurant context is required.');
        return;
      }
      const token = sessionStorage.getItem("token");
      try {
        const response = await axios.patch(`${url}/api/user/toggle-cart-lock`, 
                          { userId, restaurantId },
                          { headers: { token } });            
        if (response.data.success) {
          const { isLocked, lockedRestaurants } = response.data.data;
          setUsers(prevUsers =>
            prevUsers.map(u =>
            u._id === userId 
            ? { ...u, cartLocks: lockedRestaurants || {} } 
            : u))

          const actionText = isLocked ? 'locked' : 'unlocked';
          toast.success(`"${confirmDialog.userName}" cart has been ${actionText} for ${confirmDialog.restaurantName || 'this restaurant'}.`);
        } else {
          toast.error(response.data.message || 'Failed to toggle cart lock');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to toggle cart lock';
        toast.error(errorMessage);
      }
        
      setConfirmDialog({ isOpen: false, userId: null, userName: '', action: '', restaurantId: '', restaurantName: '' });
    };

    const handleCancelToggleLock = () => {
      setConfirmDialog({ isOpen: false, userId: null, userName: '', action: '', restaurantId: '', restaurantName: '' });
    };

  useEffect(() => {
    fetchPermissions();
    fetchRestaurants();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [filterRestaurantId]);

  return (
    <div className='users add flex-col'>
      <div className="users-header">
        <p>Users Management</p>
        <div className='users-actions'>
          {role === 'superadmin' && (
            <div className='restaurant-filter'>
              <label htmlFor='restaurantFilter'>Restaurant scope</label>
              <select
                id='restaurantFilter'
                value={filterRestaurantId}
                onChange={handleRestaurantFilterChange}
              >
                <option value=''>All restaurants</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
                ))}
              </select>
            </div>
          )}
          <button className="add-user-btn" onClick={handleAddClick}>
             Add User
          </button>
        </div>
      </div>
      {role === 'superadmin' && !filterRestaurantId && (
        <div className='lock-hint'>Select a restaurant to lock or unlock carts for a specific location.</div>
      )}
      <div className="users-table">
        <div className="users-table-format title">
          <b>Name</b>
          <b>Email</b>
          <b>Cart Items</b>
          <b>Action</b>
        </div>
        {users.map((user, index) => {
          const cartItemsCount = Object.values(user.cartData || {}).reduce((a, b) => a + b, 0);
          const lockedMap = user.cartLocks || {};
          const isLocked = activeRestaurantId ? Boolean(lockedMap[activeRestaurantId]) : false;
          const lockButtonDisabled = role === 'superadmin' && !activeRestaurantId;

          return (
            <div key={user._id || index} className="users-table-format">
              <p>{user.name}</p>
              <p>{user.email}</p>
              <p>{cartItemsCount}</p>
              <div className="user-actions">
                <a href={`/edit-user/${user._id}`} onClick={(e) => handleEditClick(e, user._id)} className='cursor edit-link' style={{marginRight:10}}>Edit</a>
                <button 
                  onClick={() => toggleCartLock(user)} 
                  className={`toggle-btn ${isLocked ? 'locked' : 'unlocked'}`}
                  disabled={lockButtonDisabled}
                >
                  {isLocked ? '🔓 Unlock Cart' : '🔒 Lock Cart'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm Status Change"
        message={`Are you sure you want to ${confirmDialog.action} "${confirmDialog.userName}" cart for ${confirmDialog.restaurantName || 'this restaurant'}?`}
        onConfirm={handleConfirmToggleLock}
        onCancel={handleCancelToggleLock}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  )
}

export default ListUser