import React from 'react'
import './Orders.css'
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { assets } from './../../../../frontend/src/assets/assets';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

const Orders = ({url}) => {

  const [orders, setOrders] = useState([])
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    orderId: null,
    newStatus: '',
    orderInfo: ''
  });

  const fetchAllOrders = async () =>{
    const response = await axios.get(url+"/api/order/list");
      if(response.data.success){
        setOrders(response.data.data);
        console.log(response.data.data);
      }else{
        toast.error("Error")
      }
  }

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    const currentOrder = orders.find(order => order._id === orderId);
    
    if (currentOrder && currentOrder.status === newStatus) {
      return; // Không thay đổi nếu trạng thái giống nhau
    }

    const statusText = {
      'Food Processing': 'đang xử lý',
      'Out for delivery': 'đang giao hàng',
      'Delivered': 'đã giao hàng'
    };

    const orderInfo = `${currentOrder?.address.firstName} ${currentOrder?.address.lastName}`;
    
    setConfirmDialog({
      isOpen: true,
      orderId: orderId,
      newStatus: newStatus,
      orderInfo: `Đơn hàng của ${orderInfo} thành "${statusText[newStatus] || newStatus}"`
    });
    
    // Reset select về giá trị cũ
    event.target.value = currentOrder?.status || 'Food Processing';
  };

  const handleConfirmStatusChange = async () => {
    const { orderId, newStatus } = confirmDialog;
    
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: newStatus
      });
      
      if(response.data.success){
        await fetchAllOrders();
        const statusText = {
          'Food Processing': 'đang xử lý',
          'Out for delivery': 'đang giao hàng',
          'Delivered': 'đã giao hàng'
        };
        toast.success(`Đã cập nhật trạng thái thành "${statusText[newStatus] || newStatus}"`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Không thể cập nhật trạng thái đơn hàng");
    }
    
    setConfirmDialog({ isOpen: false, orderId: null, newStatus: '', orderInfo: '' });
  };

  const handleCancelStatusChange = () => {
    setConfirmDialog({ isOpen: false, orderId: null, newStatus: '', orderInfo: '' });
  };

  useEffect(()=>{
    fetchAllOrders()
  }, [])
  return (
    <div className='order add'>
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index)=>(
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-food">
                {order.items.map((item,index) => {
                  if(index===order.items.length-1){
                    return item.name + " x " + item.quantity
                  }else{
                    return item.name + " x " + item.quantity + " , "
                  }
                })}
              </p>
              <p className="order-item-name">{order.address.firstName + " "+order.address.lastName}</p>
              <div className="order-item-address">
                <p>{order.address.state + ","}</p>
                <p>{order.address.city+" ,"+ order.address.state+" ,"+order.address.country+" ,"+order.address.zipcode}</p>
              </div>
              <p className='order-item-phone'>{order.address.phone}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <p>${order.amount}</p>
            <select onChange={(event)=> statusHandler(event,order._id)} value={order.status} >
              <option value="Food Processing">Food Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận thay đổi trạng thái"
        message={`Bạn có chắc chắn muốn thay đổi trạng thái ${confirmDialog.orderInfo}?`}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
    </div>
  )
}

export default Orders