import React, { useEffect, useState } from 'react';
import './ManagePermission.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

const ManagePermission = ({ url }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionDialog, setPermissionDialog] = useState({ isOpen: false, module: '', action: '', currentValue: false });

  const formatPermissionName = (action) => {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const fetchRestaurant = async () => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await axios.get(`${url}/api/restaurant/get`, { params: { id }, headers: { token } });
      if (response.data.success) {
        setRestaurant(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch restaurant');
        navigate('/restaurants');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch restaurant');
      navigate('/restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRestaurant(); }, [id]);

  const requestTogglePermission = (module, action, currentValue) => {
    setPermissionDialog({ isOpen: true, module, action, currentValue });
  };

  const confirmTogglePermission = async () => {
    const token = sessionStorage.getItem('token');
    const { module, action, currentValue } = permissionDialog;
    try {
      const response = await axios.patch(`${url}/api/restaurant/toggle-permission`, { restaurantId: id, module, action, value: !currentValue }, { headers: { token } });
      if (response.data.success) {
        setRestaurant(response.data.data);
        toast.success(`Permission ${module}.${action} set to ${!currentValue}`);
      } else {
        toast.error(response.data.message || 'Failed to update permission');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update permission');
    } finally {
      setPermissionDialog({ isOpen: false, module: '', action: '', currentValue: false });
    }
  };

  const cancelTogglePermission = () => {
    setPermissionDialog({ isOpen: false, module: '', action: '', currentValue: false });
  };

  if (loading) {
    return <div className='manage-permission loading'><p>Loading...</p></div>;
  }

  if (!restaurant) {
    return <div className='manage-permission error'><p>Restaurant not found</p></div>;
  }

  return (
    <div className='manage-permission'>
      <div className='permission-header'>
        <h2>Manage Permissions</h2>
        <p className='restaurant-name'>{restaurant.name}</p>
      </div>

      <div className='permissions-container'>
        <p className='description'>Enable or disable permissions for this restaurant. Disabled permissions prevent admin access to those functions.</p>
        
        <div className='permissions-grid'>
          <div className='permission-group'>
            <h3 className='group-title'>🍔 Food Management</h3>
            {['add_food', 'edit_food', 'list_food', 'remove_food'].map((action) => (
              <div className='permission-item' key={action}>
                <span>{formatPermissionName(action)}</span>
                <label className='switch'>
                  <input
                    type='checkbox'
                    checked={!!restaurant.permissions?.food?.[action]}
                    onChange={() => requestTogglePermission('food', action, restaurant.permissions?.food?.[action])}
                  />
                  <span className='slider'></span>
                </label>
              </div>
            ))}
          </div>

          <div className='permission-group'>
            <h3 className='group-title'>📦 Order Management</h3>
            {['list', 'update_status'].map((action) => (
              <div className='permission-item' key={action}>
                <span>{formatPermissionName(action)}</span>
                <label className='switch'>
                  <input
                    type='checkbox'
                    checked={!!restaurant.permissions?.orders?.[action]}
                    onChange={() => requestTogglePermission('orders', action, restaurant.permissions?.orders?.[action])}
                  />
                  <span className='slider'></span>
                </label>
              </div>
            ))}
          </div>

          <div className='permission-group'>
            <h3 className='group-title'>👥 User Management</h3>
            {['add_user', 'edit_user', 'get_all_users', 'toggle_cart_lock'].map((action) => (
              <div className='permission-item' key={action}>
                <span>{formatPermissionName(action)}</span>
                <label className='switch'>
                  <input
                    type='checkbox'
                    checked={!!restaurant.permissions?.users?.[action]}
                    onChange={() => requestTogglePermission('users', action, restaurant.permissions?.users?.[action])}
                  />
                  <span className='slider'></span>
                </label>
              </div>
            ))}
          </div>

          <div className='permission-group'>
            <h3 className='group-title'>🏢 Restaurant Management</h3>
            {['edit_restaurant'].map((action) => (
              <div className='permission-item' key={action}>
                <span>{formatPermissionName(action)}</span>
                <label className='switch'>
                  <input
                    type='checkbox'
                    checked={!!restaurant.permissions?.restaurant?.[action]}
                    onChange={() => requestTogglePermission('restaurant', action, restaurant.permissions?.restaurant?.[action])}
                  />
                  <span className='slider'></span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={permissionDialog.isOpen}
        title='Confirm Permission Change'
        message={`Toggle permission ${permissionDialog.module}.${permissionDialog.action} to ${!permissionDialog.currentValue}?`}
        onConfirm={confirmTogglePermission}
        onCancel={cancelTogglePermission}
        confirmText='Confirm'
        cancelText='Cancel'
      />
      <div className='permission-actions'>
        <button className='back-btn' onClick={() => navigate('/restaurants')}>🔙 Back</button>
      </div>
    </div>
  );
};

export default ManagePermission;
