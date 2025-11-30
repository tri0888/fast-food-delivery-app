import React, { useContext, useEffect, useCallback } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from './../../components/context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Verify = () => {

    const [searchParams] = useSearchParams();
    const success                         = searchParams.get("success")
    const orderIdParam                    = searchParams.get("orderId") || ''
    const sessionId                       = searchParams.get("session_id")
    const {url}                           = useContext(StoreContext);
    const navigate                        = useNavigate();

    const orderIds = orderIdParam
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0)

    const verifyPayment = useCallback(async () =>{
        if (!success || !sessionId) {
            toast.error('Missing payment session. Please try again.');
            navigate('/');
            return;
        }

        try {
            const payload = {
                success,
                sessionId,
            }

            if (orderIds.length === 1) {
                payload.orderId = orderIds[0]
            } else if (orderIds.length > 1) {
                payload.orderIds = orderIds
            }

            const response = await axios.post(url+"/api/order/verify",
                                              payload);
            if(response.data.success){
                toast.success('Payment verified successfully. Redirecting to My Orders...');
                navigate('/myorders', { replace: true });
            }
            else{
                toast.info('Payment cancelled. You were not charged.');
                navigate('/')
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Unable to verify payment. Please try again later.'
            toast.error(message)
            navigate('/')
        }
    }, [success, orderIds.join(','), sessionId, navigate, url])
    
    useEffect(()=>{
        verifyPayment();
    }, [verifyPayment])
   
  return (
    <div className='verify'>
        <div className="spinner"></div>
    </div>
  )
}

export default Verify