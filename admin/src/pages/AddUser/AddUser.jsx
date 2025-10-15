import React, { useState } from 'react';
import './AddUser.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

const AddUser = ({ url }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setConfirmDialog({ isOpen: true });
  };

  const handleConfirmAdd = async () => {
    const token = sessionStorage.getItem("token");
    
    try {
      const response = await axios.post(`${url}/api/user/add`, {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        role: data.role
      }, {
        headers: { token }
      });

      if (response.data.success) {
        setData({
          name: '',
          email: '',
          password: '',
          role: 'user'
        });
        toast.success(response.data.message);
        navigate('/users');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add user');
    }
    
    setConfirmDialog({ isOpen: false });
  };

  const handleCancelAdd = () => {
    setConfirmDialog({ isOpen: false });
  };

  return (
    <div className='add-user'>
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <h2>Add New User</h2>
        
        <div className="add-user-field flex-col">
          <p>User Name</p>
          <input 
            onChange={onChangeHandler} 
            value={data.name} 
            type="text" 
            name='name' 
            placeholder='Enter full name' 
            required 
          />
        </div>

        <div className="add-user-field flex-col">
          <p>Email</p>
          <input 
            onChange={onChangeHandler} 
            value={data.email} 
            type="email" 
            name='email' 
            placeholder='Enter email address' 
            required 
            disabled={true}
          />
        </div>

        <div className="add-user-field flex-col">
          <p>Password</p>
          <input 
            onChange={onChangeHandler} 
            value={data.password} 
            type="password" 
            name='password' 
            placeholder='Enter password (min 8 characters)' 
            minLength="8"
            required 
          />
        </div>

        <div className="add-user-field flex-col">
          <p>Role</p>
          <select onChange={onChangeHandler} name="role" value={data.role}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className='button-group'>
          <button type='button' className='back-btn' onClick={() => navigate('/users')}>
            🔙 Back
          </button>
          <button type='submit' className='add-btn'>ADD USER</button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm Add User"
        message={`Are you sure you want to add user "${data.name}" with email "${data.email}"?`}
        onConfirm={handleConfirmAdd}
        onCancel={handleCancelAdd}
        confirmText="Add"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AddUser;
