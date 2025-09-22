import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './FoodDetails.css'
import { StoreContext } from '../../components/context/StoreContext'
import { assets } from '../../assets/assets'

const FoodDetails = () => {
    const { id } = useParams()
    const { food_list, cartItems, addToCart, removeFromCart, url } = useContext(StoreContext)
    const [food, setFood] = useState(null)

    useEffect(() => {
        if (food_list && food_list.length > 0) {
            const selectedFood = food_list.find(item => item._id === id)
            setFood(selectedFood)
        }
    }, [food_list, id])

    return (
        <>
            {food ? (
                <div className="food-details">
                    <div className="food-details-container">
                        <div className="food-details-image">
                            <img src={url + '/images/' + food.image} alt={food.name} />
                        </div>
                        <div className="food-details-info">
                            <h1 className="food-details-name">{food.name}</h1>
                            <span className="food-details-category">{food.category}</span>
                            <div className="food-details-rating">
                                <img src={assets.rating_starts} alt="rating" />
                                <p>(148 ratings)</p>
                            </div>
                            <p className="food-details-description">{food.description}</p>
                            <p className="food-details-price">${food.price}</p>
                            
                            <div className="add-to-cart-section">
                                <div className="stock-status">
                                    Available: {food.stock} items
                                </div>
                                {food.stock > 0 ? (
                                    cartItems && cartItems[id] > 0 ? (
                                        <div className="quantity-control">
                                            <img 
                                                onClick={() => removeFromCart(id)} 
                                                src={assets.remove_icon_red} 
                                                alt="remove" 
                                            />
                                            <p>{cartItems[id]}</p>
                                            {cartItems[id] < food.stock && (
                                                <img 
                                                    onClick={() => addToCart(id)} 
                                                    src={assets.add_icon_green} 
                                                    alt="add" 
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <button onClick={() => addToCart(id)} className="add-to-cart-button">
                                            Add to Cart
                                        </button>
                                    )
                                ) : (
                                    <div className="out-of-stock-message">Out of Stock</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </>
    )
}

export default FoodDetails