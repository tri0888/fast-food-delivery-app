import React from 'react'
import './Orders.css'
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { assets } from './../../assets/assets';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

const Orders = ({url}) => {

  const [orders, setOrders] = useState([])
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    orderId: null,
    newStatus: '',
    orderInfo: ''
  });

  const fetchAllOrders = async () => {
    const token = sessionStorage.getItem("token");
    const response = await axios.get(url + "/api/order/list", {
                                     headers: { token }});    
    if (response.data.success) {
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
      return;
    }

    const orderInfo = `${currentOrder?.address.firstName} ${currentOrder?.address.lastName}`;
    
    setConfirmDialog({
      isOpen: true,
      orderId: orderId,
      newStatus: newStatus,
      orderInfo: `${orderInfo} become "${newStatus || newStatus}"`
    });

    // Reset select về giá trị cũ
    event.target.value = currentOrder?.status || 'Food Processing';
  };

  const handleConfirmStatusChange = async () => {
    const { orderId, newStatus, orderInfo } = confirmDialog;
    const token = sessionStorage.getItem("token");
    
    try {
      const response = await axios.patch(`${url}/api/order/status`, 
                                          {orderId, status: newStatus},
                                          {headers: {token}});
      
      if(response.data.success){
        await fetchAllOrders();
        toast.success(`The order of ${orderInfo}`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update order status");
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
        title="Confirm Status Change"
        message={`Are you sure you want to change the status of the order of ${confirmDialog.orderInfo}?`}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  )
}

export default Orders