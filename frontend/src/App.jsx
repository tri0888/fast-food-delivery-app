import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import {Route, Routes} from 'react-router-dom'
import Home from './pages/Home/Home'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Verify from './pages/Verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'
import FoodDetails from './pages/FoodDetails/FoodDetails'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {

  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
      {showLogin
       ? <LoginPopup setShowLogin={setShowLogin}/>
       : <></>}
      <div className='app'>
        <ToastContainer/>
        <Navbar setShowLogin={setShowLogin}/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/order' element={<PlaceOrder/>}/>
          <Route path='/verify' element={<Verify/>}/>
          <Route path='/myorders' element={<MyOrders/>}/>
          <Route path='/food/:id' element={<FoodDetails/>}/>
        </Routes>
      </div>
      <Footer/>
    </>
  )
}

export default App