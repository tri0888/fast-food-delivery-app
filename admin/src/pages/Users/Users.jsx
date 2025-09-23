import React, { useContext, useEffect, useState } from 'react';
import './Users.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom';

const Users = ({url}) => {
    const navigate          = useNavigate();
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${url}/api/user/list`);
            if(response.data.success) {
              setUsers(response.data.data);
            } 
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch users");
        }
    }

    const toggleCartLock = async (userId) => {
        try {
            const response = await axios.post(`${url}/api/user/toggle-cart-lock`, 
                                              {userId});
            if (response.data.success) {
                const newStatus = response.data.data.isCartLock;
                setUsers(prevUsers =>
                  prevUsers.map(u =>
                    u._id === userId 
                    ? { ...u, isCartLock: newStatus } 
                    : u))
                toast.success(`Cart ${newStatus ? 'locked' : 'unlocked'} successfully`);
                navigate(0);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to toggle cart lock");
        }
    };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className='users add flex-col'>
      <p>Users Management</p>
      <div className="users-table">
        <div className="users-table-format title">
          <b>Name</b>
          <b>Email</b>
          <b>Cart Items</b>
          <b>Action</b>
        </div>
        {users.map((user, index) => {
          const cartItemsCount = Object.values(user.cartData || {}).reduce((a, b) => a + b, 0);
          const isLocked = user.isCartLock;

          return (
            <div key={index} className="users-table-format">
              <p>{user.name}</p>
              <p>{user.email}</p>
              <p>{cartItemsCount}</p>
              <button 
                onClick={() => toggleCartLock(user)} 
                className={`toggle-btn ${isLocked ? 'locked' : 'unlocked'}`}
              >
                {isLocked ? 'Unlock Cart' : 'Lock Cart'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Users