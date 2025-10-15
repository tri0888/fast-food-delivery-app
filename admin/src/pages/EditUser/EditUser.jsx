import React, { useEffect, useState } from 'react';
import './EditUser.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

const EditUser = ({ url }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    isCartLock: false
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const response = await axios.get(`${url}/api/user/list`, {
          headers: { token }
        });
        if (response.data.success) {
          const user = response.data.data.find(u => u._id === id);
          if (user) {
            setData({
              name: user.name,
              email: user.email,
              password: '',
              role: user.role,
              isCartLock: user.isCartLock
            });
          } else {
            toast.error('User not found');
            navigate('/users');
          }
        }
      } catch (error) {
        toast.error('Failed to fetch user details');
        navigate('/users');
      }
    };
    fetchUser();
  }, [id, url, navigate]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked;
    }
    setData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setConfirmDialog({ isOpen: true });
  };

  const handleConfirmUpdate = async () => {
    const token = sessionStorage.getItem("token");
    
    try {
      const updateData = {
        id: id,
        name: data.name.trim(),
        email: data.email.trim(),
        role: data.role,
        isCartLock: data.isCartLock
      };
      
      // Only include password if it's provided
      if (data.password.trim()) {
        updateData.password = data.password;
      }

      const response = await axios.patch(`${url}/api/user/edit`, updateData, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/users');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
    
    setConfirmDialog({ isOpen: false });
  };

  const handleCancelUpdate = () => {
    setConfirmDialog({ isOpen: false });
  };

  return (
    <div className='edit-user'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <h2>Edit User</h2>

        <div className='edit-user-field flex-col'>
          <p>User Name</p>
          <input 
            onChange={onChangeHandler} 
            value={data.name} 
            type='text' 
            name='name' 
            placeholder='Enter full name' 
            required 
          />
        </div>

        <div className='edit-user-field flex-col'>
          <p>Email</p>
          <input 
            onChange={onChangeHandler} 
            value={data.email} 
            type='email' 
            name='email' 
            placeholder='Enter email address' 
            required 
            disabled={true}
          />
        </div>

        <div className='edit-user-field flex-col'>
          <p>New Password (leave blank to keep current)</p>
          <input 
            onChange={onChangeHandler} 
            value={data.password} 
            type='password' 
            name='password' 
            placeholder='Enter new password (optional)' 
            minLength="8"
          />
        </div>

        <div className='edit-user-field flex-col'>
          <p>Role</p>
          <select onChange={onChangeHandler} name='role' value={data.role}>
            <option value='user'>User</option>
            <option value='admin'>Admin</option>
          </select>
        </div>

        <div className='edit-user-extra-fields'>
          <label>
            <input 
              type='checkbox' 
              name='isCartLock' 
              checked={data.isCartLock} 
              onChange={onChangeHandler} 
            /> 
            Cart Locked
          </label>
        </div>

        <div className='button-group'>
          <button type='button' className='back-btn' onClick={() => navigate('/users')}>
            🔙 Back
          </button>
          <button type='submit' className='edit-btn'>UPDATE USER</button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm User Update"
        message={`Are you sure you want to update user "${data.name}"?${data.password.trim() ? ' The password will be changed.' : ''}`}
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
        confirmText="Update"
        cancelText="Cancel"
      />
    </div>
  );
};

export default EditUser;
