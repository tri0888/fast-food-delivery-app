import React from 'react'
import './Orders.css'
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { assets } from './../../assets/assets';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

const STATUS_FLOW = {
  'Pending Confirmation': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Out for delivery'],
  'Out for delivery': ['Delivered'],
  'Delivered': [],
  'Cancelled': []
}

const ALL_STATUSES = ['Pending Confirmation', 'Confirmed', 'Out for delivery', 'Delivered', 'Cancelled']
const STATUS_LABELS = {
  'Pending Confirmation': 'Pending confirmation',
  'Confirmed': 'Confirmed',
  'Out for delivery': 'Out for delivery',
  'Delivered': 'Delivered',
  'Cancelled': 'Cancelled'
}

const DRONE_STATUS_LABELS = {
  'awaiting-drone': 'Awaiting drone',
  'flying': 'Flying',
  'delivered': 'Delivered',
  'returning': 'Returning to base',
  'idle': 'Idle',
  'cancelled': 'Cancelled'
}

const getStatusLabel = (status) => STATUS_LABELS[status] || status
const PAYMENT_LABELS = {
  pending: 'Pending',
  authorized: 'Authorized',
  captured: 'Captured',
  failed: 'Failed'
}

const INITIAL_DIALOG_STATE = {
  isOpen: false,
  orderId: null,
  newStatus: '',
  orderInfo: '',
  droneId: '',
  restaurantId: ''
}

const Orders = ({url}) => {

  const [orders, setOrders] = useState([])
  const [confirmDialog, setConfirmDialog] = useState({ ...INITIAL_DIALOG_STATE })
  const [droneSelection, setDroneSelection] = useState({ options: [], loading: false })

  const fetchAllOrders = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.get(url + "/api/order/list", {
                                       headers: { token }});    
      if (response.data.success) {
        setOrders(response.data.data);
        console.log(response.data.data);
      }else{
        toast.error(response.data.message || "Error")
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch orders';
      toast.error(errorMessage);
    }
  }

  const resetConfirmDialog = () => {
    setConfirmDialog({ ...INITIAL_DIALOG_STATE })
    setDroneSelection({ options: [], loading: false })
  }

  const fetchIdleDrones = async (restaurantId) => {
    const token = sessionStorage.getItem("token");
    try {
      setDroneSelection({ options: [], loading: true })
      const response = await axios.get(`${url}/api/drone/list`, {
        params: { res_id: restaurantId, status: 'idle' },
        headers: { token }
      })
      const list = response.data?.data || []
      setDroneSelection({ options: list, loading: false })
      return list
    } catch (error) {
      setDroneSelection({ options: [], loading: false })
      const errorMessage = error.response?.data?.message || 'Failed to load idle drones'
      toast.error(errorMessage)
      return []
    }
  }

  const handleDroneSelectionChange = (event) => {
    setConfirmDialog(prev => ({ ...prev, droneId: event.target.value }))
  }

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    const currentOrder = orders.find(order => order._id === orderId);
    const currentStatusKey = currentOrder?.status === 'Food Processing' ? 'Pending Confirmation' : currentOrder?.status

    if (newStatus === 'Delivered') {
      toast.info('Delivery status is updated automatically');
      event.target.value = currentStatusKey;
      return;
    }
    
    if (currentOrder && currentOrder.status === newStatus) {
      return;
    }

    const allowedStatuses = STATUS_FLOW[currentStatusKey] || []
    const paymentReady = ['authorized', 'captured'].includes(currentOrder?.paymentStatus)
    if (!allowedStatuses.includes(newStatus)) {
      toast.warning('This status transition is not allowed');
      event.target.value = currentOrder?.status || 'Pending Confirmation';
      return;
    }

    if (newStatus !== 'Cancelled' && !paymentReady) {
      toast.warning('Payment must be authorized before advancing the order');
      event.target.value = currentOrder?.status || 'Pending Confirmation';
      return;
    }

    const orderInfo = `${currentOrder?.address.firstName} ${currentOrder?.address.lastName}`;
    const nextStatusLabel = getStatusLabel(newStatus === 'Food Processing' ? 'Pending Confirmation' : newStatus)

    if (newStatus === 'Out for delivery') {
      const idleDrones = await fetchIdleDrones(currentOrder?.res_id)
      if (idleDrones.length === 0) {
        toast.warning('No idle drone is available for this restaurant yet. Please try again once one returns.')
        event.target.value = currentStatusKey;
        return;
      }
    } else {
      setDroneSelection({ options: [], loading: false })
    }
    
    setConfirmDialog({
      isOpen: true,
      orderId: orderId,
      newStatus: newStatus,
      orderInfo: `${orderInfo} → ${nextStatusLabel}`,
      droneId: '',
      restaurantId: currentOrder?.res_id
    });

    // Reset select về giá trị cũ
    event.target.value = currentStatusKey;
  };

  const handleConfirmStatusChange = async () => {
    const { orderId, newStatus, orderInfo, droneId } = confirmDialog;
    const token = sessionStorage.getItem("token");

    if (newStatus === 'Out for delivery' && !droneId) {
      toast.warning('Please select an idle drone to dispatch.');
      return;
    }
    const payload = { orderId, status: newStatus }
    if (newStatus === 'Out for delivery') {
      payload.droneId = droneId
    }
    
    try {
      const response = await axios.patch(`${url}/api/order/status`, 
                                          payload,
                                          {headers: {token}});
      
      if(response.data.success){
        await fetchAllOrders();
        toast.success(`The order of ${orderInfo}`);
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update order status';
      toast.error(errorMessage);
    }
    
    resetConfirmDialog();
  };

  const handleCancelStatusChange = () => {
    resetConfirmDialog();
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
                {(order.food_items || order.items || []).map((item,index, arr) => {
                  if(index===arr.length-1){
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
              <p className='order-item-drone'>
                Drone: {DRONE_STATUS_LABELS[order?.droneTracking?.adminStatus || order?.droneTracking?.status || 'awaiting-drone']}
                {order?.droneTracking?.assignedDrone?.name && ` · ${order.droneTracking.assignedDrone.name}`}
                {order?.droneTracking?.status === 'awaiting-drone' && <span className='order-item-drone__note'>&nbsp;(None available yet)</span>}
              </p>
            </div>
            <p>Items: {(order.food_items || order.items || []).length}</p>
            <p>${order.amount}</p>
            <p className="payment-status">Payment: {PAYMENT_LABELS[order.paymentStatus || 'pending'] || 'Pending'}</p>
            <select onChange={(event)=> statusHandler(event,order._id)} value={order.status === 'Food Processing' ? 'Pending Confirmation' : order.status} >
              {ALL_STATUSES.map((statusOption) => {
                const normalizedStatus = order.status === 'Food Processing' ? 'Pending Confirmation' : order.status
                const allowed = STATUS_FLOW[normalizedStatus] || []
                const isCurrent = statusOption === normalizedStatus
                const isAllowedOption = allowed.includes(statusOption)
                if (!isCurrent && !isAllowedOption) {
                  return null
                }

                const paymentReady = ['authorized', 'captured'].includes(order.paymentStatus)
                const requiresPayment = statusOption !== 'Cancelled'
                const transitionBlocked = !isCurrent && requiresPayment && !paymentReady
                const isDeliveryStatus = statusOption === 'Delivered'
                const isDisabled = isCurrent || isDeliveryStatus || transitionBlocked
                const label = getStatusLabel(statusOption)
                return (
                  <option key={statusOption} value={statusOption} disabled={isDisabled}>
                    {label}
                  </option>
                )
              })}
            </select>
          </div>
        ))}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm Status Change"
        message={`Are you sure you want to change the order status for ${confirmDialog.orderInfo}?`}
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
        confirmText="Confirm"
        cancelText="Cancel"
        disableConfirm={confirmDialog.newStatus === 'Out for delivery' && (droneSelection.loading || !confirmDialog.droneId)}
      >
        {confirmDialog.newStatus === 'Out for delivery' && (
          <div className='drone-select-panel'>
            {droneSelection.loading ? (
              <p className='drone-select-panel__loading'>Loading idle drones…</p>
            ) : (
              <>
                <label htmlFor='drone-select'>Select an idle drone</label>
                <select
                  id='drone-select'
                  value={confirmDialog.droneId}
                  onChange={handleDroneSelectionChange}
                >
                  <option value=''>-- Choose drone --</option>
                  {droneSelection.options.map((drone) => (
                    <option key={drone._id} value={drone._id}>
                      {drone.name} · {(drone.res_id?.name) || 'Restaurant'}
                    </option>
                  ))}
                </select>
                <small>The drone will start flying immediately after confirmation.</small>
              </>
            )}
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}

export default Orders