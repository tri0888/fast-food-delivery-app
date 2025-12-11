import React, { useEffect, useMemo, useState } from 'react'
import './ListDrone.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import DroneTracker from '../../components/DroneTracker/DroneTracker'

const DRONE_STATUS_LABELS = {
  idle: 'Idle',
  flying: 'Flying',
  delivered: 'Delivered',
  returning: 'Returning',
  cancelled: 'Cancelled'
}

const CUSTOMER_STATUS_LABELS = {
  'awaiting-drone': 'Awaiting drone',
  flying: 'Flying',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
}

const ADMIN_STATUS_LABELS = {
  ...CUSTOMER_STATUS_LABELS,
  returning: 'Returning',
  idle: 'Idle'
}

const FLYPATH_OPTIONS = ['low', 'medium', 'high']

const formatOrderId = (orderId = '') => {
  if (!orderId) return '--'
  return `#${String(orderId).slice(-6).toUpperCase()}`
}

const formatRelativeTime = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  if (diff < 60000) return 'just now'
  const minutes = Math.round(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  return `${hours}h ago`
}

const formatCoords = (location = {}) => {
  if (typeof location.lat !== 'number' || typeof location.lng !== 'number') return '--'
  return `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`
}

const formatFlyPath = (value) => {
  if (!value || typeof value !== 'string') return '—'
  const trimmed = value.trim()
  if (!trimmed) return '—'
  return trimmed.length > 1
    ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
    : trimmed.toUpperCase()
}

const ListDrone = ({ url }) => {
  const [drones, setDrones] = useState([])
  const [selectedDroneId, setSelectedDroneId] = useState(null)
  const [userHasInteracted, setUserHasInteracted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [filters, setFilters] = useState({ flypath: 'all' })
  const navigate = useNavigate()
  const role = sessionStorage.getItem('role')

  const fetchDrones = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.get(`${url}/api/drone/list`, { headers: { token } })
      if (response.data.success) {
        setDrones(response.data.data || [])
        setLastUpdated(new Date().toISOString())
      } else {
        toast.error(response.data.message || 'Failed to fetch drones')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch drones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrones()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredDrones = useMemo(() => {
    if (filters.flypath === 'all') return drones
    return drones.filter((drone) => (drone.flypath || '').toLowerCase() === filters.flypath)
  }, [drones, filters.flypath])

  useEffect(() => {
    if (!filteredDrones.length) {
      if (selectedDroneId !== null) {
        setSelectedDroneId(null)
      }
      return
    }

    if (selectedDroneId) {
      const stillExists = filteredDrones.some((drone) => drone._id === selectedDroneId)
      if (!stillExists) {
        setSelectedDroneId(userHasInteracted ? null : filteredDrones[0]._id)
      }
      return
    }

    if (!userHasInteracted) {
      setSelectedDroneId(filteredDrones[0]._id)
    }
  }, [filteredDrones, selectedDroneId, userHasInteracted])

  const handleToggle = (id) => {
    setUserHasInteracted(true)
    setSelectedDroneId((prev) => (prev === id ? null : id))
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
    setUserHasInteracted(false)
  }

  return (
    <div className='drone-monitor'>
      <div className='drone-monitor__header'>
        <div>
          <h3>Drone Monitor</h3>
          <p>Track fleet utilization and live assignments</p>
          {lastUpdated && <small>Last refresh: {new Date(lastUpdated).toLocaleTimeString()}</small>}
        </div>
        <div className='drone-monitor__actions'>
          {role === 'superadmin' && (
            <div className='drone-filter'>
              <label htmlFor='flypath-filter'>Fly path</label>
              <select
                id='flypath-filter'
                name='flypath'
                value={filters.flypath}
                onChange={handleFilterChange}
              >
                <option value='all'>All paths</option>
                {FLYPATH_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {formatFlyPath(option)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button className='ghost-btn' onClick={fetchDrones} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          {role === 'superadmin' && (
            <button className='primary-btn' onClick={() => navigate('/drones/add')}>
              + Add Drone
            </button>
          )}
        </div>
      </div>

      <div className='drone-monitor__body'>
        <div className='drone-summary__head'>
          <span>Drone</span>
          <span>Status</span>
          <span>Fly path</span>
          <span>Current Order</span>
          <span>Updated</span>
          <span>Return ETA</span>
        </div>
        <div className='drone-accordion'>
          {filteredDrones.length === 0 && !loading && (
            <div className='drone-table__empty'>
              {filters.flypath === 'all'
                ? 'No drones found.'
                : `No drones with ${formatFlyPath(filters.flypath)} path.`}
            </div>
          )}
          {filteredDrones.map((drone) => {
            const isExpanded = selectedDroneId === drone._id
            const tracking = drone.currentOrder?.droneTracking
            return (
              <div key={drone._id} className={`drone-card ${isExpanded ? 'drone-card--open' : ''}`}>
                <button type='button' className='drone-card__header' onClick={() => handleToggle(drone._id)}>
                  <div className='drone-card__summary'>
                    <div>
                      <p className='drone-row__name'>{drone.name}</p>
                      <small>{drone.res_id?.name || 'No restaurant'}</small>
                    </div>
                    <span className={`chip chip--${drone.status}`}>
                      {DRONE_STATUS_LABELS[drone.status] || drone.status}
                    </span>
                    <div className='drone-flypath'>
                      <p className='drone-flypath__value'>{formatFlyPath(drone.flypath)}</p>
                      <small>Fly path</small>
                    </div>
                    <div>
                      <p>{formatOrderId(drone.activeOrderId)}</p>
                      <small>
                        {typeof drone.customerProgress === 'number' && !Number.isNaN(drone.customerProgress)
                          ? `${drone.customerProgress}% progress`
                          : drone.statusLabel || 'Idle'}
                      </small>
                    </div>
                    <div>
                      <p>{formatRelativeTime(drone.lastStatusChange)}</p>
                      <small>Status age</small>
                    </div>
                    <div>
                      <p>{drone.returnETA ? new Date(drone.returnETA).toLocaleTimeString() : '--'}</p>
                      <small>Return ETA</small>
                    </div>
                  </div>
                  <span className={`drone-card__chevron ${isExpanded ? 'drone-card__chevron--open' : ''}`} aria-hidden='true'>▾</span>
                </button>

                {isExpanded && (
                  <div className='drone-card__body'>
                    {drone.currentOrder && tracking ? (
                      <>
                        <div className='drone-card__grid'>
                          <div>
                            <small>Order</small>
                            <p>{formatOrderId(drone.currentOrder._id)}</p>
                          </div>
                          <div>
                            <small>Customer status</small>
                            <p>{CUSTOMER_STATUS_LABELS[tracking.status] || tracking.status || 'waiting'}</p>
                          </div>
                          <div>
                            <small>Admin status</small>
                            <p>{ADMIN_STATUS_LABELS[tracking.adminStatus] || tracking.adminStatus || 'waiting'}</p>
                          </div>
                          <div>
                            <small>Amount</small>
                            <p>${drone.currentOrder.amount?.toFixed(2) || '--'}</p>
                          </div>
                        </div>

                        <DroneTracker tracking={tracking} droneStatus={drone.status} returnETA={drone.returnETA} />

                        <div className='drone-card__locations'>
                          <div>
                            <small>Restaurant</small>
                            <p>{tracking.restaurantLocation?.label || drone.res_id?.name || 'N/A'}</p>
                            <span>{formatCoords(tracking.restaurantLocation)}</span>
                          </div>
                          <div>
                            <small>Customer</small>
                            <p>{tracking.customerLocation?.label || 'Delivery address'}</p>
                            <span>{formatCoords(tracking.customerLocation)}</span>
                          </div>
                        </div>

                        {tracking.history?.length ? (
                          <div className='drone-card__history'>
                            <small>Recent updates</small>
                            <ul>
                              {[...tracking.history].reverse().map((entry, index) => (
                                <li key={`${entry.status}-${index}`}>
                                  <strong>{entry.status}</strong>
                                  <span>{new Date(entry.at).toLocaleTimeString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className='drone-detail__empty'>No tracking history yet.</p>
                        )}
                      </>
                    ) : (
                      <p className='drone-detail__empty'>This drone is currently idle.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ListDrone
