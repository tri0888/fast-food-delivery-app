import React, { useContext} from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../context/StoreContext';

const FoodItem = ({id,name,price,description,image}) => {

    const {food_list} = useContext(StoreContext);
    const foodItem = food_list.find(item => item._id === id);
    const stock = foodItem ? foodItem.stock : 0;

    const {cartItems,addToCart,removeFromCart,url} = useContext(StoreContext);

  return (
    <div className='food-item'>
        <div className="food-item-img-container">
            <a href={`/food/${id}`} className="food-item-link">
                <img className='food-item-image' src={url+'/images/'+image} alt="" />
            </a>
           {cartItems && cartItems[id] > 0 ? (
  <div className="food-item-counter">
    <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="" />
    <p>{cartItems[id]}</p>
    <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="" />
  </div>
) : stock > 0 ? (
  <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt="Add" />
) : (
  <span className="out-of-stock">Out of Stock</span>
)}

        </div>
        <div className="food-item-info">
            <div className="food-item-name-rating">
                <p>{name}</p>
                <img src={assets.rating_starts} alt="" />
            </div>
            <p className="food-item-desc">{description}</p>
            <p className="food-item-price">${price}</p>
        </div>
    </div>
  )
}

export default FoodItem