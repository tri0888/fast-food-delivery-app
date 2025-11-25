import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from './../../components/context/StoreContext';
import axios from 'axios';
import { assets } from './../../assets/assets';
import { toast } from 'react-toastify';

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

const MyOrders = () => {

const {url, token}    = useContext(StoreContext);
const [data, setData] = useState([]);
const [restaurantMap, setRestaurantMap] = useState({});

const fetchOrders = async () =>{
    const response = await axios.post(url+'/api/order/userorders',
                                      {},
                                      {headers:{token}})
    setData(response.data.data);
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
                        {order.status === 'Out for delivery' && order.paymentStatus === 'authorized' ? (
                            <button onClick={() => markAsReceived(order._id)}>
                                Confirm delivery
                            </button>
                        ) : (
                            <button onClick={fetchOrders}>Track order</button>
                        )}
                    </div>
                )
            })}
        </div>
    </div>
  )
}

export default MyOrders