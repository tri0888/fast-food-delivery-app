import React, { useEffect, useState } from 'react';
import './Edit.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const Edit = ({ url }) => {
  const { id } = useParams();
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Salad',
    isAvailable: true,
    stock: 0,
    discount: 0,
    rating: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFood = async () => {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        const food = response.data.data.find(f => f._id === id);
        if (food) {
          setData({
            name: food.name,
            description: food.description,
            price: food.price,
            category: food.category,
            isAvailable: food.isAvailable,
            stock: food.stock,
            discount: food.discount,
            rating: food.rating
          });
          setImage(food.image);
        }
      }
    };
    fetchFood();
  }, [id, url]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    if (event.target.type === 'checkbox') value = event.target.checked;
    setData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', Number(data.price));
    formData.append('category', data.category);
    formData.append('isAvailable', data.isAvailable);
    formData.append('stock', Number(data.stock));
    formData.append('discount', Number(data.discount));
    formData.append('rating', Number(data.rating));
    if (image && typeof image !== 'string') formData.append('image', image);
    const response = await axios.post(`${url}/api/food/edit`, formData);
    if (response.data.success) {
      toast.success(response.data.message);
      navigate('/list');
    } else {
      toast.error(response.data.message);
    }
  };

  return (
    <div className='edit'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className='edit-img-upload flex-col'>
          <p>Upload Image</p>
          <label htmlFor='image'>
            <img src={image ? (typeof image === 'string' ? `${url}/images/${image}` : URL.createObjectURL(image)) : ''} alt='' />
          </label>
          <input onChange={e => setImage(e.target.files[0])} type='file' id='image' hidden />
        </div>
        <div className='edit-product-name flex-col'>
          <p>Product name</p>
          <input onChange={onChangeHandler} value={data.name} type='text' name='name' placeholder='Type Here' />
        </div>
        <div className='edit-product-description flex-col'>
          <p>Product description</p>
          <textarea onChange={onChangeHandler} value={data.description} name='description' rows='6' placeholder='Write content here' required></textarea>
        </div>
        <div className='edit-category-price'>
          <div className='edit-category flex-col'>
            <p>Product category</p>
            <select onChange={onChangeHandler} name='category' value={data.category}>
              <option value='Salad'>Salad</option>
              <option value='Rolls'>Rolls</option>
              <option value='Deserts'>Deserts</option>
              <option value='Sandwich'>Sandwich</option>
              <option value='Cake'>Cake</option>
              <option value='Pure Veg'>Pure Veg</option>
              <option value='Pasta'>Pasta</option>
              <option value='Noodles'>Noodles</option>
            </select>
          </div>
          <div className='edit-price flex-col'>
            <p>Product price</p>
            <input onChange={onChangeHandler} value={data.price} type='number' name='price' placeholder='$20' />
          </div>
        </div>
        <div className='edit-extra-fields'>
          <div>
            <label>
              <input type='checkbox' name='isAvailable' checked={data.isAvailable} onChange={onChangeHandler} /> Available
            </label>
          </div>
          <div>
            <label>Stock</label>
            <input type='number' name='stock' value={data.stock} onChange={onChangeHandler} min='0' />
          </div>
          <div>
            <label>Discount (%)</label>
            <input type='number' name='discount' value={data.discount} onChange={onChangeHandler} min='0' max='100' />
          </div>
          <div>
            <label>Rating</label>
            <input type='number' name='rating' value={data.rating} onChange={onChangeHandler} min='0' max='5' step='0.1' />
          </div>
        </div>
        <button type='submit' className='edit-btn'>UPDATE</button>
      </form>
    </div>
  );
};

export default Edit;
