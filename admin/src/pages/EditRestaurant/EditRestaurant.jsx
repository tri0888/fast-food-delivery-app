import React, { useState, useEffect } from 'react';
import './EditRestaurant.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const EditRestaurant = ({ url }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      const token = sessionStorage.getItem('token');
      try {
        const response = await axios.get(`${url}/api/restaurant/get`, { params: { id }, headers: { token } });
        if (response.data.success) {
          const { name, address, phone } = response.data.data;
          setFormData({ name, address, phone });
        } else {
          toast.error(response.data.message || 'Failed to fetch restaurant');
          navigate('/restaurants');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch restaurant');
        navigate('/restaurants');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Not authenticated');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.patch(`${url}/api/restaurant/edit`, { id, ...formData }, { headers: { token } });
      if (response.data.success) {
        toast.success('Restaurant updated');
        navigate('/restaurants');
      } else {
        toast.error(response.data.message || 'Failed to update restaurant');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update restaurant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/restaurants');
  };

  if (loading) {
    return <div className="edit-restaurant-page"><p>Loading...</p></div>;
  }

  return (
    <div className="edit-restaurant-page">
      <form className="restaurant-form" onSubmit={handleSubmit}>
        <h3>Edit Restaurant</h3>
        <div className="form-field">
          <label>Restaurant Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter restaurant name"
            required
          />
        </div>
        <div className="form-field">
          <label>Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter restaurant address"
            required
          />
        </div>
        <div className="form-field">
          <label>Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            required
          />
        </div>
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={handleCancel} disabled={isSubmitting}>🔙 Back</button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Update Restaurant'}</button>
        </div>
      </form>
    </div>
  );
};

export default EditRestaurant;
