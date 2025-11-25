import React, { useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AddFoods from './pages/AddFoods/AddFoods';
import ListFood from './pages/ListFood/ListFood';
import Orders from './pages/Orders/Orders';
import ListUser from './pages/ListUser/ListUser';
import EditFoods from './pages/EditFoods/EditFoods';
import AddUser from './pages/AddUser/AddUser';
import EditUser from './pages/EditUser/EditUser';
import ListRestaurant from './pages/ListRestaurant/ListRestaurant';
import AddRestaurant from './pages/AddRestaurant/AddRestaurant';
import EditRestaurant from './pages/EditRestaurant/EditRestaurant';
import ManagePermission from './pages/ManagePermission/ManagePermission';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {

  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const navigate = useNavigate();
  useEffect(() => {
    const decodePayload = (jwtToken) => {
      if (!jwtToken) return null;
      try {
        const base64Url = jwtToken.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
      } catch {
        return null;
      }
    };

    const cacheAdminInfo = (token) => {
      const payload = decodePayload(token);
      if (payload?.role) {
        sessionStorage.setItem('role', payload.role);
      }
      if (payload?.name) {
        sessionStorage.setItem('adminName', payload.name);
      } else {
        sessionStorage.removeItem('adminName');
      }
      if (payload?.restaurantId) {
        sessionStorage.setItem('restaurantId', payload.restaurantId);
      } else {
        sessionStorage.removeItem('restaurantId');
      }
      return payload;
    };

    const getDefaultRoute = (role) => role === 'superadmin' ? '/restaurants' : '/list-user';

    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const storedToken = sessionStorage.getItem('token');

    if (tokenParam) {
      sessionStorage.setItem('token', tokenParam);
      const payload = cacheAdminInfo(tokenParam);
      navigate(window.location.pathname, { replace: true });
      navigate(getDefaultRoute(payload?.role));
      return;
    }

    if (storedToken) {
      const payload = cacheAdminInfo(storedToken);
      if (window.location.pathname === '/' || window.location.pathname === '') {
        navigate(getDefaultRoute(payload?.role));
      }
      return; // already logged in
    }

    alert('Please login as admin to access the admin panel.');
    window.location.href = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
  }, [navigate]);
  return (
    <div>
      <ToastContainer/>
      <Navbar/>
      <hr/>
      <div className="app-content">
        <Sidebar/>
        <Routes>
          <Route path='/' element={<Navigate to={`/${window.location.search}`} replace />} />
          <Route path='/add' element={<AddFoods url={url} />} />
          <Route path='/list-food' element={<ListFood url={url}/>} />
          <Route path='/orders' element={<Orders url={url}/>} />
          <Route path='/list-user' element={<ListUser url={url}/>} />
          <Route path='/edit/:id' element={<EditFoods url={url}/>} />
          <Route path='/add-user' element={<AddUser url={url}/>} />
          <Route path='/edit-user/:id' element={<EditUser url={url}/>} />
          
          <Route path='/restaurants' element={<ListRestaurant url={url}/>} />
          <Route path='/restaurants/add' element={<AddRestaurant url={url}/>} />
          <Route path='/restaurants/edit/:id' element={<EditRestaurant url={url}/>} />
          <Route path='/restaurants/:id/permissions' element={<ManagePermission url={url}/>} />
        </Routes>
      </div>
    </div>
  )
}

export default App