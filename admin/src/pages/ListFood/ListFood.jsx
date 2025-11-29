import React, { useEffect, useState } from 'react'
import './ListFood.css'
import axios from 'axios'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

const ListFood = ({url}) => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [permissions, setPermissions] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    foodId: null,
    foodName: ''
  });

  const fetchList = async () =>{
    const token = sessionStorage.getItem("token");
    try {
      const response = await axios.get(`${url}/api/food/admin/list`, { headers: { token } });
      
      if(response.data.success){
        setList(response.data.data)
      }
      else{
        toast.error(response.data.message || "Error")
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch food list';
      toast.error(errorMessage);
    }
  }

  const fetchPermissions = async () => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem('role');
    if (role === 'admin' || role === 'superadmin') {
      try {
        const response = await axios.get(`${url}/api/restaurant/permissions`, { headers: { token } });
        if (response.data.success) {
          setPermissions(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch permissions');
      }
    }
  };

  const handleAddClick = () => {
    const role = sessionStorage.getItem('role');
    if (role === 'superadmin' || permissions?.food?.add_food) {
      navigate('/add');
    } else {
      toast.error('Permission "food.add_food" is disabled for your restaurant');
    }
  };

  const handleEditClick = (e, foodId) => {
    e.preventDefault();
    const role = sessionStorage.getItem('role');
    if (role === 'superadmin' || permissions?.food?.edit_food) {
      navigate(`/edit/${foodId}`);
    } else {
      toast.error('Permission "food.edit_food" is disabled for your restaurant');
    }
  };

  const handleDeleteClick = (foodId, foodName) => {
    const role = sessionStorage.getItem('role');
    if (role === 'superadmin' || permissions?.food?.remove_food) {
      setConfirmDialog({
        isOpen: true,
        foodId: foodId,
        foodName: foodName
      });
    } else {
      toast.error('Permission "food.remove_food" is disabled for your restaurant');
    }
  };

  const handleConfirmDelete = async () => {
    const { foodId } = confirmDialog;
    
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(`${url}/api/food/remove`, 
                                          {id: foodId},
                                          {headers: {token}});
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
    fetchPermissions();
  }, [])
  return (
    <div className='list add flex-col'>
      <div className="list-header">
        <p>All Foods List</p>
        <button className="add-food-btn" onClick={handleAddClick}>➕ Add Food</button>
      </div>
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
                <a href={`/edit/${item._id}`} onClick={(e) => handleEditClick(e, item._id)} className='cursor' style={{marginRight:8}}>Edit</a>
                <span onClick={()=> handleDeleteClick(item._id, item.name)} className='cursor delete-btn-food'>🗑️</span>
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

export default ListFood