import React, { useEffect, useState } from 'react'
import './List.css'
import axios from 'axios'
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

const List = ({url}) => {

  const [list, setList] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    foodId: null,
    foodName: ''
  });

  const fetchList = async () =>{
    const response = await axios.get(`${url}/api/food/list`)
     
      if(response.data.success){
        setList(response.data.data)
      }
      else{
        toast.error("Error")
      }
    }
  

  const handleDeleteClick = (foodId, foodName) => {
    setConfirmDialog({
      isOpen: true,
      foodId: foodId,
      foodName: foodName
    });
  };

  const handleConfirmDelete = async () => {
    const { foodId } = confirmDialog;
    
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(`${url}/api/food/remove`, 
                                          {data   : {id: foodId},
                                          headers : {token}});
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
    
    // Close dialog
    setConfirmDialog({ isOpen: false, foodId: null, foodName: '' });
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, foodId: null, foodName: '' });
  };

  useEffect(()=>{
    fetchList();
  }, [])
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
                <span onClick={()=> handleDeleteClick(item._id, item.name)} className='cursor delete-btn'>🗑️</span>
              </div>
            </div>
          )
        })}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa "${confirmDialog.foodName}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  )
}

export default List