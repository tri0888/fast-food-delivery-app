import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Users.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

const Users = ({ url }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    action: ''
  });

  const fetchUsers = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.get(`${url}/api/user/list`, {
        headers: { token }
      });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch users");
    }
  }

  const toggleCartLock = (user) => {
    const currentStatus = user.isCartLock;
    const action = currentStatus ? 'Unlock Cart' : 'Lock Cart';

    setConfirmDialog({
      isOpen: true,
      userId: user._id,
      userName: user.name,
      action: action
    });
  };

  const handleConfirmToggleLock = async () => {
    const { userId } = confirmDialog;
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.patch(`${url}/api/user/toggle-cart-lock`,
        { userId },
        { headers: { token } });
      if (response.data.success) {
        const newStatus = response.data.data.isCartLock;
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u._id === userId
              ? { ...u, isCartLock: newStatus }
              : u))

        const actionText = newStatus ? 'Locked' : 'Unlocked';
        toast.success(`"${confirmDialog.userName}" shopping cart has been ${actionText} successfully`);
      }
    } catch (error) {
      toast.error("Failed to toggle cart lock");
    }

    setConfirmDialog({ isOpen: false, userId: null, userName: '', action: '' });
  };

  const handleCancelToggleLock = () => {
    setConfirmDialog({ isOpen: false, userId: null, userName: '', action: '' });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className='users add flex-col'>
      <div className="users-header">
        <p>Users Management</p>
        <button className="add-user-btn" onClick={() => navigate('/add-user')}>
          Add User
        </button>
      </div>
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
              <div className="user-actions">
                <Link to={`/edit-user/${user._id}`} className='cursor edit-link' style={{ marginRight: 10 }}>Edit</Link>
                <button
                  onClick={() => toggleCartLock(user)}
                  className={`toggle-btn ${isLocked ? 'locked' : 'unlocked'}`}
                >
                  {isLocked ? '🔓 Unlock Cart' : '🔒 Lock Cart'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm Status Change"
        message={`Are you sure you want to ${confirmDialog.action} "${confirmDialog.userName}"'s shopping cart?`}
        onConfirm={handleConfirmToggleLock}
        onCancel={handleCancelToggleLock}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  )
}

export default Users