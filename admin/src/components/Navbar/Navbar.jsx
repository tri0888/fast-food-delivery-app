import React from 'react'
import './Navbar.css'
import { assets } from './../../assets/assets';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const logout = () => {
    sessionStorage.removeItem("token");
    window.location.href = 'http://localhost:5173';
  };

  return (
    <div className='navbar'>
      <img className='logo' src={assets.logo} alt="" />
      <div className='navbar-right'>
        <img src={assets.profile_image} alt="" className="profile" />
        <button onClick={logout} className='logout-btn'>Logout</button>
      </div>
    </div>
  )
}

export default Navbar