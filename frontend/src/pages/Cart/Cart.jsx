import React, { useContext, useEffect, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../components/context/StoreContext'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Cart = () => {
    const {cartItems, 
      food_list, 
      removeFromCart, 
      addToCart, 
      getTotalCartAmount, 
      url, 
      lockedRestaurants,
      isRestaurantLocked} = useContext(StoreContext);
  const navigate       = useNavigate();
  const [catalogMap, setCatalogMap] = useState({});
  const [restaurantMap, setRestaurantMap] = useState({});

  const getRestaurantName = (restaurantId) => {
    if (!restaurantId) return 'Locked restaurant';
    return restaurantMap[restaurantId]?.name || 'Locked restaurant';
  };

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [foodsRes, restaurantsRes] = await Promise.all([
          axios.get(url + '/api/food/list'),
          axios.get(url + '/api/restaurant/public/list'),
        ]);

        const foods = foodsRes.data?.data || [];
        const foodLookup = foods.reduce((acc, food) => {
          acc[food._id] = food;
          return acc;
        }, {});
        setCatalogMap(foodLookup);

        const restaurants = restaurantsRes.data?.data || [];
        const restaurantLookup = restaurants.reduce((acc, restaurant) => {
          acc[restaurant._id] = restaurant;
          return acc;
        }, {});
        setRestaurantMap(restaurantLookup);
      } catch (error) {
        console.error('Failed to load catalog data', error);
      }
    };

    fetchCatalog();
  }, [url]);

  const cartEntries = Object.entries(cartItems).filter(([, quantity]) => quantity > 0);
  const lockedRestaurantIdsInCart = cartEntries.reduce((acc, [foodId, quantity]) => {
    if (quantity <= 0) {
      return acc;
    }
    const item = catalogMap[foodId] || food_list.find((food) => food._id === foodId);
    if (!item) {
      return acc;
    }
    if (isRestaurantLocked(item.res_id)) {
      acc.add(String(item.res_id));
    }
    return acc;
  }, new Set());
  const hasLockedItems = lockedRestaurantIdsInCart.size > 0;

  return (
    <div className='cart'>
      {hasLockedItems && (
        <div className='cart-lock-warning'>
          <p>Ordering is temporarily paused for:</p>
          <ul>
            {Array.from(lockedRestaurantIdsInCart).map((restaurantId) => (
              <li key={restaurantId}>{getRestaurantName(restaurantId)}</li>
            ))}
          </ul>
          <p className='cart-lock-hint'>Please remove these items to proceed to checkout.</p>
        </div>
      )}
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
        {cartEntries.map(([foodId, quantity]) => {
          const item = catalogMap[foodId] || food_list.find((food) => food._id === foodId);
          if (!item) {
            return null;
          }

          const restaurantName = restaurantMap[item.res_id]?.name || 'Unknown restaurant';
          const restaurantLocked = isRestaurantLocked(item.res_id);

          return (
            <React.Fragment key={foodId}>
                <div className="cart-items-title cart-items-item">
                <img src={url+'/images/'+item.image} alt="" />
                <div className='cart-item-title'>
                  <p>{item.name}</p>
                  <span className='cart-restaurant-label'>Restaurant: {restaurantName}</span>
                  {restaurantLocked && (
                    <span className='cart-lock-tag'>Ordering locked by admin</span>
                  )}
                </div>
                <p>${item.price}</p>
                <div className="cart-quantity">
                  <span onClick={() => removeFromCart(item._id)} className="cart-action-btn">-</span>
                  <div className="quantity-display">
                    {quantity}
                    <span className="stock-info">
                      (Available: {item.stock})
                    </span>
                  </div>
                  <span
                    onClick={() => {
                      if (!restaurantLocked) {
                        addToCart(item._id);
                      }
                    }}
                    className={`cart-action-btn ${restaurantLocked ? 'disabled' : ''}`}
                    style={{cursor: restaurantLocked ? 'not-allowed' : 'pointer'}}
                  >
                    +
                  </span>
                </div>
                <p>${item.price*quantity}</p>
                <div className="cart-actions">
                  <span onClick={() => removeFromCart(item._id, true)} className='cross'>x</span>
                </div>
              </div>
              <hr />
            </React.Fragment>
          );
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
          <button
            onClick={() => !hasLockedItems 
                                   ? navigate('/order') 
                                   : toast.error("Remove items from locked restaurants before checkout")}
            disabled={hasLockedItems}
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