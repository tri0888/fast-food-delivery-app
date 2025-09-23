import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../components/context/StoreContext'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cart = () => {
  const {cartItems, 
         food_list, 
         removeFromCart, 
         addToCart, 
         getTotalCartAmount, 
         url, 
         isCartLocked} = useContext(StoreContext);
  const navigate       = useNavigate();

  return (
    <div className='cart'>
      {isCartLocked && <p>Your cart has been locked by admin</p>}
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item,index)=>{
          if(cartItems[item._id]>0){
            return (
              <div>
                <div className="cart-items-title cart-items-item">
                <img src={url+'/images/'+item.image} alt="" />
                <p>{item.name}</p>
                <p>${item.price}</p>
                <div className="cart-quantity">
                  {!isCartLocked && (
                    <span onClick={() => removeFromCart(item._id)} className="cart-action-btn">-</span>
                  )}
                  <div className="quantity-display">
                    {cartItems[item._id]}
                    <span className="stock-info">
                      (Available: {item.stock})
                    </span>
                  </div>
                  {!isCartLocked && (
                    <span onClick={() => addToCart(item._id)} className="cart-action-btn" style={{cursor: 'pointer'}}>+</span>
                  )}
                </div>
                <p>${item.price*cartItems[item._id]}</p>
                <div className="cart-actions">
                  {!isCartLocked && (
                    <span onClick   = {() => !isCartLocked && removeFromCart(item._id, true)} 
                          className = {`cross ${isCartLocked ? 'disabled' : ''}`}>x</span>
                  )}
                </div>
              </div>
              <hr />
              </div>
            );
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-detail">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount()===0?0:2}</p>
            </div>
            <hr />
            <div className="cart-total-detail">
              <b>Total</b>
              <b>${getTotalCartAmount()===0?0:getTotalCartAmount()+2}</b>
            </div> 
          </div>
          <button onClick={() => ! isCartLocked 
                                 ? navigate('/order') 
                                 : toast.error("Cart is locked by admin")}
          >PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <div className='cart-promocode-input'>
              <input type="text" placeholder='Promo Code'/>
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart