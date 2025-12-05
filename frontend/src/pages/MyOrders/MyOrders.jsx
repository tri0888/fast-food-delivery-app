import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from './../../components/context/StoreContext';
import axios from 'axios';
import { assets } from './../../assets/assets';
import { toast } from 'react-toastify';
import DroneTracker from '../../components/DroneTracker/DroneTracker';

const CUSTOMER_NOTIFICATION_KEY = 'customerSeenFlightNotifications'

const STATUS_LABELS = {
    'Pending Confirmation': 'Pending confirmation',
    'Confirmed': 'Confirmed',
    'Out for delivery': 'Out for delivery',
    'Delivered': 'Delivered',
    'Cancelled': 'Cancelled'
}

const PAYMENT_LABELS = {
    pending: 'Pending',
    authorized: 'Authorized',
    captured: 'Captured',
    failed: 'Failed'
}

const DRONE_STATUS_LABELS = {
    'awaiting-drone': 'Awaiting drone',
    'flying': 'Flying',
    'delivered': 'Delivered',
    'returning': 'Returning',
    'cancelled': 'Cancelled'
}

const MyOrders = () => {

const {url, token}    = useContext(StoreContext);
const [data, setData] = useState([]);
const [restaurantMap, setRestaurantMap] = useState({});
const [expandedOrderId, setExpandedOrderId] = useState(null);

const processTransientNotifications = (ordersList = []) => {
    if (typeof window === 'undefined') return
    try {
        const seen = new Set()
        const stored = window.sessionStorage.getItem(CUSTOMER_NOTIFICATION_KEY)
        if (stored) {
            JSON.parse(stored).forEach((id) => seen.add(id))
        }

        let flushed = false
        ordersList.forEach((order) => {
            const notifications = order?.droneTracking?.notifications || []
            notifications.forEach((notification) => {
                if (!notification?.id) return
                if (seen.has(notification.id)) return
                toast.info(notification.message, { autoClose: 15000 })
                seen.add(notification.id)
                flushed = true
            })
        })

        if (flushed) {
            window.sessionStorage.setItem(CUSTOMER_NOTIFICATION_KEY, JSON.stringify(Array.from(seen)))
        }
    } catch (error) {
        console.error('Unable to process flight notifications', error)
    }
}

const fetchOrders = async () =>{
    try {
        const response = await axios.post(url+'/api/order/userorders',
                                          {},
                                          {headers:{token}})
        const ordersList = response.data?.data || []
        setData(ordersList)
        processTransientNotifications(ordersList)
    } catch (error) {
        const message = error.response?.data?.message || 'Unable to load your orders'
        toast.error(message)
    }
}

const fetchRestaurants = async () => {
    try {
        const response = await axios.get(url + '/api/restaurant/public/list');
        const restaurants = response.data?.data || [];
        const lookup = restaurants.reduce((acc, restaurant) => {
            if (restaurant && restaurant._id) {
                acc[restaurant._id] = restaurant;
            }
            return acc;
        }, {});
        setRestaurantMap(lookup);
    } catch (error) {
        console.error('Failed to load restaurants for orders', error);
    }
}

const markAsReceived = async (orderId) => {
    try {
        const response = await axios.patch(url + '/api/order/confirm-delivery',
                                           { orderId },
                                           { headers: { token } })
        if (response.data.success) {
            toast.success('Thanks for confirming delivery!')
            fetchOrders()
        } else {
            toast.error(response.data.message || 'Unable to update order')
        }
    } catch (error) {
        const message = error.response?.data?.message || 'Unable to update order'
        toast.error(message)
    }
}

const toggleTracking = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId)
}

useEffect(()=>{
    if(token){
        fetchOrders();
    }
},[token])

useEffect(() => {
    fetchRestaurants();
}, [url])

  return (
    <div className='my-orders'>
        <h2>My Orders</h2>
        <div className="container">
            {data.map((order, index) => {
                const customerName = [order.address?.firstName, order.address?.lastName]
                    .filter(Boolean)
                    .join(' ')
                    .trim() || 'Customer'
                return (
                    <div key={index} className="my-orders-order">
                        <img src={assets.parcel_icon} alt="" />
                        <div className='order-items-details'>
                            <p>{(order.food_items || order.items || []).map((item, index, arr) => {
                                if(index === arr.length-1){
                                    return item.name+" x "+item.quantity
                                }else{
                                    return item.name+" x "+item.quantity + ","
                                }
                            })}</p>
                            <span className='order-restaurant-label'>
                                Restaurant: {restaurantMap[order.res_id]?.name || 'Unknown restaurant'}
                            </span>
                            <span className='order-customer-label'>
                                Customer: {customerName}
                            </span>
                        </div>
                        <div className='order-payment-state'>
                            <p>${order.amount}.00</p>
                            <span className={`payment-chip ${order.paymentStatus || 'pending'}`}>
                                {PAYMENT_LABELS[order.paymentStatus || 'pending'] || 'Pending'}
                            </span>
                        </div>
                        <p>Items: {(order.food_items || order.items || []).length}</p>
                        {(() => {
                            const normalized = order.status === 'Food Processing' ? 'Pending Confirmation' : order.status
                            const label = STATUS_LABELS[normalized] || normalized
                            return <p><span>&#x25cf;</span><b>{label}</b></p>
                        })()}
                        <div className='order-actions'>
                            <button className='track-btn' onClick={() => toggleTracking(order._id)}>
                                {expandedOrderId === order._id ? 'Hide tracking' : 'Track order'}
                            </button>
                            {order.status === 'Out for delivery' && order.paymentStatus === 'authorized' && (
                                <button className='confirm-btn' onClick={() => markAsReceived(order._id)}>
                                    Confirm delivery
                                </button>
                            )}
                        </div>
                        {order.droneTracking && (
                            <p className='drone-status-chip'>
                                Drone: {DRONE_STATUS_LABELS[order.droneTracking.status] || 'Awaiting drone'}
                                {order.droneTracking.status === 'awaiting-drone' && <span className='drone-status-chip__note'>&nbsp;- None drone available</span>}
                            </p>
                        )}
                        {expandedOrderId === order._id && (
                            <DroneTracker tracking={order.droneTracking} />
                        )}
                    </div>
                )
            })}
        </div>
    </div>
  )
}

export default MyOrders