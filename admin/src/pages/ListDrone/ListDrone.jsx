import React, { useEffect, useMemo, useState } from 'react'
import './ListDrone.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import DroneTracker from '../../components/DroneTracker/DroneTracker'

const DRONE_STATUS_LABELS = {
  idle: 'Idle',
  preparing: 'Preparing',
  flying: 'Flying',
  delivered: 'Delivered',
  returning: 'Returning',
  cancelled: 'Cancelled'
}

const DRONE_STEPS = ['awaiting-drone', 'preparing', 'flying', 'delivered']

const CUSTOMER_STATUS_LABELS = {
  'awaiting-drone': 'Awaiting drone',
  preparing: 'Preparing',
  flying: 'Flying',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
}

const ADMIN_STATUS_LABELS = {
  ...CUSTOMER_STATUS_LABELS,
  returning: 'Returning',
  idle: 'Idle'
}

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

const computeProgress = (status = 'awaiting-drone') => {
  const index = DRONE_STEPS.indexOf(status)
  if (index === -1) return 0
  const span = Math.max(1, DRONE_STEPS.length - 1)
  return Math.round((index / span) * 100)
}

const ListDrone = ({ url }) => {
  const [drones, setDrones] = useState([])
  const [selectedDroneId, setSelectedDroneId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const navigate = useNavigate()
  const role = sessionStorage.getItem('role')

  const selectedDrone = useMemo(() => {
    if (!selectedDroneId) return null
    return drones.find((drone) => drone._id === selectedDroneId) || null
  }, [drones, selectedDroneId])

  const fetchDrones = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.get(`${url}/api/drone/list`, { headers: { token } })
      if (response.data.success) {
        setDrones(response.data.data || [])
        setLastUpdated(new Date().toISOString())
        if (!selectedDroneId && response.data.data?.length) {
          setSelectedDroneId(response.data.data[0]._id)
        }
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

  useEffect(() => {
    if (!selectedDroneId && drones.length) {
      setSelectedDroneId(drones[0]._id)
      return
    }

    if (selectedDroneId && drones.length) {
      const stillExists = drones.some((drone) => drone._id === selectedDroneId)
      if (!stillExists) {
        setSelectedDroneId(drones[0]._id)
      }
    }
  }, [drones, selectedDroneId])

  const tracking = selectedDrone?.currentOrder?.droneTracking
  const customerProgress = computeProgress(tracking?.status)

  return (
    <div className='drone-monitor'>
      <div className='drone-monitor__header'>
        <div>
          <h3>Drone Monitor</h3>
          <p>Track fleet utilization and live assignments</p>
          {lastUpdated && <small>Last refresh: {new Date(lastUpdated).toLocaleTimeString()}</small>}
        </div>
        <div className='drone-monitor__actions'>
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
        <div className='drone-table'>
          <div className='drone-table__head'>
            <span>Drone</span>
            <span>Status</span>
            <span>Current Order</span>
            <span>Updated</span>
            <span>Return ETA</span>
          </div>
          <div className='drone-table__list'>
            {drones.length === 0 && !loading && (
              <div className='drone-table__empty'>No drones found.</div>
            )}
            {drones.map((drone) => (
              <button
                type='button'
                key={drone._id}
                className={`drone-row ${selectedDroneId === drone._id ? 'drone-row--active' : ''}`}
                onClick={() => setSelectedDroneId(drone._id)}
              >
                <div>
                  <p className='drone-row__name'>{drone.name}</p>
                  <small>{drone.res_id?.name || 'No restaurant'}</small>
                </div>
                <span className={`chip chip--${drone.status}`}>
                  {DRONE_STATUS_LABELS[drone.status] || drone.status}
                </span>
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
              </button>
            ))}
          </div>
        </div>

        <div className='drone-detail-card'>
          {selectedDrone ? (
            <>
              <div className='drone-detail-card__header'>
                <div>
                  <h4>{selectedDrone.name}</h4>
                  <p>{selectedDrone.res_id?.name || 'Unassigned restaurant'}</p>
                </div>
                <span className={`chip chip--${selectedDrone.status}`}>
                  {DRONE_STATUS_LABELS[selectedDrone.status] || selectedDrone.status}
                </span>
              </div>

              {selectedDrone.currentOrder ? (
                <>
                  <div className='drone-detail__grid'>
                    <div>
                      <small>Order</small>
                      <p>{formatOrderId(selectedDrone.currentOrder._id)}</p>
                    </div>
                    <div>
                      <small>Customer status</small>
                      <p>{CUSTOMER_STATUS_LABELS[tracking?.status] || tracking?.status || 'waiting'}</p>
                    </div>
                    <div>
                      <small>Admin status</small>
                      <p>{ADMIN_STATUS_LABELS[tracking?.adminStatus] || tracking?.adminStatus || 'waiting'}</p>
                    </div>
                    <div>
                      <small>Amount</small>
                      <p>${selectedDrone.currentOrder.amount?.toFixed(2) || '--'}</p>
                    </div>
                  </div>

                  <DroneTracker tracking={tracking} droneStatus={selectedDrone.status} returnETA={selectedDrone.returnETA} />

                  <div className='drone-detail__locations'>
                    <div>
                      <small>Restaurant</small>
                      <p>{tracking?.restaurantLocation?.label || selectedDrone.res_id?.name || 'N/A'}</p>
                      <span>{formatCoords(tracking?.restaurantLocation)}</span>
                    </div>
                    <div>
                      <small>Customer</small>
                      <p>{tracking?.customerLocation?.label || 'Delivery address'}</p>
                      <span>{formatCoords(tracking?.customerLocation)}</span>
                    </div>
                  </div>

                  {tracking?.history?.length ? (
                    <div className='drone-detail__history'>
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
            </>
          ) : (
            <p className='drone-detail__empty'>Select a drone to inspect its tracking data.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ListDrone
