import React, { useContext, useEffect, useState } from 'react';
import './Users.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

const Users = ({url}) => {
    const navigate          = useNavigate();
    const [users, setUsers] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        userId: null,
        userName: '',
        action: ''
    });

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

    const toggleCartLock = (user) => {
        const currentStatus = user.isCartLock;
        const action = currentStatus ? 'mở khóa' : 'khóa';
        
        setConfirmDialog({
            isOpen: true,
            userId: user._id,
            userName: user.name,
            action: action
        });
    };

    const handleConfirmToggleLock = async () => {
        const { userId } = confirmDialog;
        
        try {
            const response = await axios.post(`${url}/api/user/toggle-cart-lock`, {
                userId
            });
            
            if (response.data.success) {
                const newStatus = response.data.data.isCartLock;
                setUsers(prevUsers =>
                  prevUsers.map(u =>
                    u._id === userId 
                    ? { ...u, isCartLock: newStatus } 
                    : u))
                
                const actionText = newStatus ? 'đã khóa' : 'đã mở khóa';
                toast.success(`Giỏ hàng của "${confirmDialog.userName}" ${actionText} thành công`);
                navigate(0);
            }
        } catch (error) {
            console.log(error);
            toast.error("Không thể thay đổi trạng thái khóa giỏ hàng");
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
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận thay đổi trạng thái"
        message={`Bạn có chắc chắn muốn ${confirmDialog.action} giỏ hàng của "${confirmDialog.userName}"?`}
        onConfirm={handleConfirmToggleLock}
        onCancel={handleCancelToggleLock}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
    </div>
  )
}

export default Users