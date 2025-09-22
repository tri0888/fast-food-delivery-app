import React, { useEffect, useState } from 'react'
import './List.css'
import axios from 'axios'
import { toast } from 'react-toastify';

const List = ({url}) => {

  const [list, setList] = useState([]);

  const fetchList = async () =>{
    const response = await axios.get(`${url}/api/food/list`)
   
    if(response.data.success){
      setList(response.data.data)
    }
    else{
      toast.error("Error")
    }
  }

  const removeFood = async (foodId) =>{

    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      await fetchList();
      
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        throw new Error(response.data.message || 'Error occurred while removing food.');
      }
    } catch (error) {
      console.log(error);
      
      // Check if the error has a message and display it in the toast.
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
    }
    
  }

  useEffect(()=>{
    fetchList();
  },[])
  return (
    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Stock</b>
            <b>Action</b>
        </div>
        {list.map((item,index)=>{
          return(
            <div key={index} className="list-table-format">
              <div><img src={`${url}/images/`+item.image} alt="" /></div>
              <div>{item.name}</div>
              <div>{item.category}</div>
              <div>${item.price}</div>
              <div>{item.stock}</div>
              <div>
                <a href={`/edit/${item._id}`} className='cursor' style={{marginRight:8}}>Edit</a>
                <span onClick={()=> removeFood(item._id)} className='cursor'>X</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default List