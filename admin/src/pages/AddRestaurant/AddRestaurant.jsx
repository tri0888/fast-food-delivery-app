import React, { useState } from 'react';
import './AddRestaurant.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AddRestaurant = ({ url }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', adminEmail: '', adminPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await axios.post(`${url}/api/restaurant/add`, formData, { headers: { token } });
      if (response.data.success) {
        toast.success('Restaurant added');
        navigate('/restaurants');
      } else {
        toast.error(response.data.message || 'Failed to add restaurant');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add restaurant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/restaurants');
  };

  return (
    <div className="add-restaurant-page">
      <form className="restaurant-form" onSubmit={handleSubmit}>
        <h3>Add New Restaurant</h3>
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
        <h3 style={{ marginTop: '20px', fontSize: '18px' }}>Admin Account</h3>
        <div className="form-field">
          <label>Admin Email *</label>
          <input
            type="email"
            name="adminEmail"
            value={formData.adminEmail}
            onChange={handleInputChange}
            placeholder="Enter admin email"
            required
          />
        </div>
        <div className="form-field">
          <label>Admin Password *</label>
          <input
            type="password"
            name="adminPassword"
            value={formData.adminPassword}
            onChange={handleInputChange}
            placeholder="Enter admin password (min 6 characters)"
            required
            minLength={6}
          />
        </div>
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={handleCancel} disabled={isSubmitting}>🔙 Back</button>
          <button type="submit" className="submit-btn" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Add Restaurant'}</button>
        </div>
      </form>
    </div>
  );
};

export default AddRestaurant;
