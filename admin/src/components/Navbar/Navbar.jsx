import React from 'react'
import './Navbar.css'
import { assets } from './../../assets/assets';

const Navbar = () => {
  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('adminName');
    window.location.href = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
  };

  const adminName = sessionStorage.getItem('adminName') || 'Admin';

  return (
    <div className='navbar'>
      <img className='logo' src={assets.logo} alt="" />
      <div className='navbar-right'>
        <div className='admin-name'>Hello, {adminName}</div>
        <img src={assets.profile_image} alt="" className="profile" />
        <button onClick={logout} className='logout-btn'>Logout</button>
      </div>
    </div>
  )
}

export default Navbar