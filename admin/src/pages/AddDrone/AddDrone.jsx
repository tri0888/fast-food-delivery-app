import React, { useEffect, useState } from 'react'
import './AddDrone.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const AddDrone = ({ url }) => {
  const [form, setForm] = useState({
    name: '',
    res_id: ''
  })
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const role = sessionStorage.getItem('role')

  useEffect(() => {
    if (role !== 'superadmin') {
      toast.error('Only superadmins can add drones')
      navigate('/drones')
      return
    }

    const fetchRestaurants = async () => {
      try {
        const token = sessionStorage.getItem('token')
        const response = await axios.get(`${url}/api/restaurant/list`, { headers: { token } })
        if (response.data.success) {
          setRestaurants(response.data.data || [])
        } else {
          toast.error(response.data.message || 'Failed to load restaurants')
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load restaurants')
      }
    }

    fetchRestaurants()
  }, [navigate, role, url])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.res_id) {
      toast.error('Please fill out all fields')
      return
    }
    setLoading(true)
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.post(
        `${url}/api/drone/add`,
        { name: form.name.trim(), res_id: form.res_id },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success('Drone created successfully')
        navigate('/drones')
      } else {
        toast.error(response.data.message || 'Failed to add drone')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add drone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='add-drone add'>
      <form className='flex-col' onSubmit={handleSubmit}>
        <h2>Register New Drone</h2>

        <div className='add-drone-field flex-col'>
          <p>Drone Name</p>
          <input
            name='name'
            value={form.name}
            onChange={onChange}
            type='text'
            placeholder='e.g. Drone A-5'
            required
          />
        </div>

        <div className='add-drone-field flex-col'>
          <p>Restaurant</p>
          <select name='res_id' value={form.res_id} onChange={onChange} required>
            <option value=''>Select restaurant</option>
            {restaurants.map((restaurant) => (
              <option value={restaurant._id} key={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        <div className='button-group'>
          <button type='button' className='back-btn' onClick={() => navigate('/drones')}>
            Cancel
          </button>
          <button type='submit' className='add-btn' disabled={loading}>
            {loading ? 'Saving...' : 'Add Drone'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddDrone
