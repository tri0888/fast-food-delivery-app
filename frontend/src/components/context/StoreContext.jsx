import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const [isCartLocked, setIsCartLocked] = useState(false);
    const [cartItems, setCartItems]       = useState({});
    const url                             = "http://localhost:4000";
    const [token,setToken]                = useState("");

    const [food_list, setFoodList] = useState([]);

    const loadCartData = async (token) =>{
        const response = await axios.post(url+"/api/cart/get",
                                          {},
                                          {headers:{token}})
        setCartItems(response.data.cartData);
        setIsCartLocked(response.data.isCartLocked || false);
    }

    const addToCart = async (itemId) => {
        if (isCartLocked) return toast.error("Cart is locked by admin");
        
        // Find the food item to check stock
        const foodItem = food_list.find(item => item._id === itemId);
        if (!foodItem) return toast.error("Product not found");
        
        // Check if adding one more would exceed stock
        const currentQuantity = cartItems[itemId] || 0;
        if (currentQuantity >= foodItem.stock) {
            toast.error(`Only ${foodItem.stock} items available in stock`);
            return;
        }

        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }))
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
        }
        if(token){
            await axios.post(url+'/api/cart/add',
                             {itemId},
                             {headers : {token}})
        }
    }

    const removeFromCart = async (itemId, removeCompletely = false) => {
        if (isCartLocked) return toast.error("Cart is locked by admin");
        
        if (removeCompletely) {
            setCartItems((prev) => {
                const newCart = { ...prev };
                delete newCart[itemId];
                return newCart;
            });
            if(token){
                await axios.post(url+'/api/cart/remove',
                                 {itemId, removeCompletely: true},
                                 {headers : {token}})
            }
        } else {
            setCartItems((prev) => {
                const newQuantity = prev[itemId] - 1;
                if (newQuantity <= 0) {
                    // If quantity reaches 0, remove item completely
                    const newCart = { ...prev };
                    delete newCart[itemId];
                    return newCart;
                }
                return { ...prev, [itemId]: newQuantity };
            });
            if(token){
                await axios.post(url+'/api/cart/remove',
                                 {itemId},
                                 {headers:{token}})
            }
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                totalAmount += itemInfo.price * cartItems[item];
            }

        }

        return totalAmount;
    }

    const fetchFoodList = async () =>{
        try {
            const response = await axios.get(url+"/api/food/list");
            const data = response && response.data && response.data.data;
            if (Array.isArray(data)) {
                setFoodList(data);
            } else if (data) {
                // sometimes backend wraps data incorrectly
                setFoodList(Array.isArray(data) ? data : [data]);
            } else {
                setFoodList([]);
            }
        } catch (err) {
            console.error('Failed to fetch food list', err);
            setFoodList([]);
        }
    }    

    useEffect(()=>{
        async function loadData(){
            await fetchFoodList();
            if(localStorage.getItem("token")){
                setToken(localStorage.getItem("token"));
                await loadCartData(localStorage.getItem("token"))
            }
        }
        loadData();
    },[])

    const contextValue = {food_list,
                          cartItems,
                          setCartItems,
                          addToCart,
                          removeFromCart,
                          getTotalCartAmount,
                          url,
                          token,
                          setToken,
                          isCartLocked}

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;