import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const [lockedRestaurants, setLockedRestaurants] = useState({});
    const [cartItems, setCartItems]       = useState({});
    const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const [token,setToken]                = useState("");
    const [userProfile, setUserProfile]   = useState(null);

    const [food_list, setFoodList] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [catalog, setCatalog] = useState([]);
    const [catalogMap, setCatalogMap] = useState({});

    const loadCartData = async (token) =>{        
        const response = await axios.get(url+"/api/cart/get",
                                         {headers:{token}})
        setCartItems(response.data.cartData);
        setLockedRestaurants(response.data.lockedRestaurants || {});
    }

    const addToCart = async (itemId) => {
        // Find the food item to check stock
        const foodItem = food_list.find(item => item._id === itemId) || catalogMap[itemId];
        if (!foodItem) return toast.error("Product not found");
        
        if (isRestaurantLocked(foodItem.res_id)) {
            return toast.error("This restaurant has temporarily locked ordering");
        }
        
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
        for (const itemId in cartItems) {
            const quantity = cartItems[itemId];
            if (quantity > 0) {
                const itemInfo = catalogMap[itemId] || food_list.find((product) => product._id === itemId);
                if (itemInfo) {
                    totalAmount += itemInfo.price * quantity;
                }
            }
        }

        return totalAmount;
    }

    const fetchFoodList = async () =>{
        try {
            const response = await axios.get(url+"/api/food/list");
            const data = response && response.data && response.data.data;
            let foodData = [];
            
            if (Array.isArray(data)) {
                foodData = data;
            } else if (data) {
                foodData = [data];
            }

            setCatalog(foodData);
            const lookup = foodData.reduce((acc, item) => {
                acc[item._id] = item;
                return acc;
            }, {});
            setCatalogMap(lookup);
        } catch (err) {
            console.error('Failed to fetch food list', err);
            setCatalog([]);
            setCatalogMap({});
            setFoodList([]);
        }
    }    

    const decodeBase64 = (value) => {
        if (typeof window !== 'undefined' && typeof window.atob === 'function') {
            return window.atob(value)
        }
        if (typeof globalThis !== 'undefined' && typeof globalThis.atob === 'function') {
            return globalThis.atob(value)
        }
        if (typeof globalThis !== 'undefined' && typeof globalThis.Buffer === 'function') {
            return globalThis.Buffer.from(value, 'base64').toString('binary')
        }
        return ''
    }

    const decodeTokenPayload = (jwtToken) => {
        if (!jwtToken) {
            return null
        }

        try {
            const base64Url = jwtToken.split('.')[1]
            if (!base64Url) {
                return null
            }
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
                decodeBase64(base64)
                    .split('')
                    .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            )
            return JSON.parse(jsonPayload)
        } catch (error) {
            console.warn('Failed to decode token payload', error)
            return null
        }
    }

    useEffect(()=>{
        async function loadData(){
            // Load selected restaurant from localStorage
            const savedRestaurant = localStorage.getItem('selectedRestaurant');
            if (savedRestaurant) {
                const restaurant = JSON.parse(savedRestaurant);
                setSelectedRestaurant(restaurant);
            }
            await fetchFoodList();
            
            if(localStorage.getItem("token")){
                setToken(localStorage.getItem("token"));
                await loadCartData(localStorage.getItem("token"))
            }
        }
        loadData();
       
    },[])

    useEffect(() => {
        if (!token) {
            setUserProfile(null)
            return
        }
        const payload = decodeTokenPayload(token)
        if (!payload) {
            setUserProfile(null)
            return
        }
        setUserProfile({
            id: payload.id || payload._id || '',
            name: payload.name || '',
            role: payload.role || 'user',
            restaurantId: payload.restaurantId || null
        })
    }, [token])

    useEffect(() => {
        if (catalog.length === 0) {
            setFoodList([]);
            return;
        }

        if (selectedRestaurant) {
            const filtered = catalog.filter(food => String(food.res_id) === String(selectedRestaurant._id));
            setFoodList(filtered);
        } else {
            setFoodList(catalog);
        }
    }, [selectedRestaurant, catalog])

    const isRestaurantLocked = (restaurantId) => {
        if (!restaurantId) {
            return false;
        }
        return Boolean(lockedRestaurants[String(restaurantId)]);
    }

    const contextValue = {food_list,
                          cartItems,
                          setCartItems,
                          addToCart,
                          removeFromCart,
                          getTotalCartAmount,
                          url,
                          token,
                          setToken,
                          lockedRestaurants,
                          isRestaurantLocked,
                          selectedRestaurant,
                          setSelectedRestaurant,
                          allFoodsMap: catalogMap,
                          userProfile}

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;