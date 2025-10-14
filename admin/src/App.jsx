import React, { useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AddFoods from './pages/AddFoods/AddFoods';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import Users from './pages/Users/Users';
import EditFoods from './pages/EditFoods/EditFoods';
import AddUser from './pages/AddUser/AddUser';
import EditUser from './pages/EditUser/EditUser';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {

  const url = 'http://localhost:4000';
  const navigate = useNavigate();
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token     = urlParams.get('token');      
    if (token != null) {
      sessionStorage.setItem('token', token);
      navigate(window.location.pathname, { replace: true });
      navigate('/users');
    }
    else if (sessionStorage.getItem('token') == null && token == null) {
      alert('Please login as admin to access the admin panel.');
      window.location.href = 'http://localhost:5173';
    }
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
          <Route path='/list' element={<List url={url}/>} />
          <Route path='/orders' element={<Orders url={url}/>} />
          <Route path='/users' element={<Users url={url}/>} />
          <Route path='/edit/:id' element={<EditFoods url={url}/>} />
          <Route path='/add-user' element={<AddUser url={url}/>} />
          <Route path='/edit-user/:id' element={<EditUser url={url}/>} />
        </Routes>
      </div>
    </div>
  )
}

export default App