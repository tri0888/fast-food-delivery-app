import React, { useState, useEffect } from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'
import axios from 'axios'

const Sidebar = () => {
  const role = sessionStorage.getItem('role');
  const [permissions, setPermissions] = useState(null);
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const fetchPermissions = async () => {
      if (role === 'admin' || role === 'superadmin') {
        const token = sessionStorage.getItem('token');
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
    fetchPermissions();
  }, [role]);

  // Show all tabs for superadmin
  if (role === 'superadmin') {
    return (
      <div className='sidebar'>
        <div className="sidebar-options">
            <NavLink to='/orders' className="sidebar-option">
              <img src={assets.order_icon} alt="" />
              <p>Orders</p>
            </NavLink>
            <NavLink to='/drones' className="sidebar-option">
              <img src={assets.order_icon} alt="" />
              <p>Drones</p>
            </NavLink>
            {/* <NavLink to='/drones/add' className="sidebar-option">
              <img src={assets.order_icon} alt="" />
              <p>Add Drone</p>
            </NavLink> */}
            <NavLink to='/restaurants' className="sidebar-option">
              <img src={assets.order_icon} alt="" />
              <p>Restaurants</p>
            </NavLink>
        </div>
      </div>
    );
  }

  // For admin, show all tabs (permission check happens on page load)
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/list-food' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>List Foods</p>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </NavLink>
        <NavLink to='/drones' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Drones</p>
        </NavLink>
        <NavLink to='/list-user' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Users</p>
        </NavLink>
        {role === 'admin' && (
          <NavLink to='/restaurants' className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Restaurants</p>
          </NavLink>
        )}
      </div>
    </div>
  )
}

export default Sidebar