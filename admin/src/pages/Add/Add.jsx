import React, {useState } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Add = ({url}) => {

    const [image, setImage] = useState(false);
    const [data, setData] = useState({name        : '',
                                      description : '',
                                      price       : '',
                                      category    : 'Salad',
                                      stock       : '',
                                      isAvailable : true})

    const onChangeHandler = (event) =>{
        const name  = event.target.name;
        const value = event.target.value;
        
        setData(data => ({...data,[name]:value}))
    }

    const onSubmitHandler = async (event) =>{
        event.preventDefault();        
        const formData = new FormData();
        formData.append('name', data.name.trim())
        formData.append('description', data.description.trim())
        formData.append('price', Number(data.price))
        formData.append('category', data.category)
        formData.append('image', image)
        formData.append('stock', Number(data.stock))        
        const response = await axios.post(`${url}/api/food/add`, formData);

        if(response.data.success){
            setData({name        : '',
                     description : '',
                     price       : '',
                     category    : 'Salad',
                     stock       : ''})
            setImage(false);
            toast.success(response.data.message)
        }else{
            toast.error(response.data.message)
        }
    }

  return (
    <div className='add'>
        <form  className="flex-col" onSubmit={onSubmitHandler}>
            <div className="add-img-upload flex-col">
                <p>Upload Image</p>
                <label htmlFor="image">
                    <img src={image
                              ? URL.createObjectURL(image)
                              : assets.upload_area} alt="" />
                </label>
                <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='image' />
            </div>
            <div className="add-product-name flex-col">
                <p>Product name</p>
                <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type Here' required />
            </div>
            <div className="add-product-description flex-col">
                <p>Product description</p>
                <textarea onChange={onChangeHandler} value={data.description} name="description" rows='6' placeholder='Write content here' required></textarea>
            </div>
            <div className="add-category-price">
                <div className="add-category flex-col">
                    <p>Product category</p>
                    <select onChange={onChangeHandler}  name="category">
                        <option value="Salad">Salad</option>
                        <option value="Rolls">Rolls</option>
                        <option value="Deserts">Deserts</option>
                        <option value="Sandwich">Sandwich</option>
                        <option value="Cake">Cake</option>
                        <option value="Pure Veg">Pure Veg</option>
                        <option value="Pasta">Pasta</option>
                        <option value="Noodles">Noodles</option>
                    </select>
                </div>
                <div className="add-price flex-col">
                    <p>Product price</p>
                    <input onChange={onChangeHandler} value={data.price} type="number" name='price' placeholder='$20' min="1" step="0.01" required/>
                </div>
                <div className="add-stock flex-col">
                    <p>Stock quantity</p>
                    <input onChange={onChangeHandler} value={data.stock} type="number" name='stock' placeholder='0' min="0" required/>
                </div>
            </div>
            <button type='submit' className='add-btn'>ADD</button>
        </form>
    </div>
  )
}

export default Add