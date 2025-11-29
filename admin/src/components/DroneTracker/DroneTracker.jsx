import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './DroneTracker.css'

// ----- Setup helpers -----
const ADMIN_STEPS = [
  { value: 'awaiting-drone', label: 'Awaiting drone', description: 'Waiting for available drone' },
  { value: 'flying', label: 'Flying to customer', description: 'Package en route to customer' },
  { value: 'delivered', label: 'Package delivered', description: 'Customer drop-off complete' },
  { value: 'returning', label: 'Returning to base', description: 'Heading back to restaurant' }
]

const ADMIN_STATUS_LABELS = ADMIN_STEPS.reduce((acc, step) => {
  acc[step.value] = step
  return acc
}, {})

const DEFAULT_ANIMATION_SECONDS = Number(import.meta.env.VITE_DRONE_ANIMATION_DURATION_SEC || 30)
const MIN_DURATION_SECONDS = 30

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const clampDuration = (value, fallback = DEFAULT_ANIMATION_SECONDS) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return Math.max(MIN_DURATION_SECONDS, fallback)
  }
  return Math.max(MIN_DURATION_SECONDS, numeric)
}
const isValidCoordinate = (value) => typeof value?.lat === 'number' && typeof value?.lng === 'number'

const interpolatePosition = (start, end, ratio) => {
  if (!isValidCoordinate(start) || !isValidCoordinate(end)) {
    return null
  }
  const safeRatio = clamp(ratio)
  return {
    lat: start.lat + (end.lat - start.lat) * safeRatio,
    lng: start.lng + (end.lng - start.lng) * safeRatio
  }
}

const buildIcon = (className, label) => L.divIcon({
  className: `drone-marker ${className}`,
  html: `<span>${label}</span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
})

const formatEta = (etaTimestamp) => {
  if (!etaTimestamp) {
    return ''
  }
  const diff = etaTimestamp - Date.now()
  if (diff <= 0) {
    return 'Arriving now'
  }
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

const DroneTracker = ({ tracking, droneStatus, returnETA }) => {
  if (!tracking) {
    return <div className='drone-tracker__empty'>Tracking data will appear once the order is confirmed.</div>
  }

  const currentAdminStatus = tracking.adminStatus || tracking.status || droneStatus || 'awaiting-drone'
  const currentCustomerStatus = tracking.status || currentAdminStatus
  const restaurantLocation = tracking.restaurantLocation
  const customerLocation = tracking.customerLocation
  const hasLocations = isValidCoordinate(restaurantLocation) && isValidCoordinate(customerLocation)
  const statusChangeTime = tracking.lastUpdated ? new Date(tracking.lastUpdated).getTime() : null
  const flightDuration = clampDuration(tracking.animationDurationSec)
  const returnDuration = clampDuration(tracking.returnDurationSec, flightDuration)

  const [flightProgress, setFlightProgress] = useState(currentAdminStatus === 'flying' ? 0 : currentCustomerStatus === 'delivered' ? 1 : 0)
  const [returnProgress, setReturnProgress] = useState(currentAdminStatus === 'returning' ? 0 : 0)
  const flightFrameRef = useRef(null)
  const returnFrameRef = useRef(null)

  // ----- Animation: flight leg -----
  useEffect(() => {
    if (currentAdminStatus !== 'flying') {
      if (flightFrameRef.current) {
        cancelAnimationFrame(flightFrameRef.current)
        flightFrameRef.current = null
      }
      setFlightProgress(currentCustomerStatus === 'delivered' ? 1 : 0)
      return
    }

    const durationMs = flightDuration * 1000
    const startTime = statusChangeTime || Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const ratio = clamp(elapsed / durationMs)
      setFlightProgress(ratio)
      if (ratio < 1) {
        flightFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (flightFrameRef.current) {
        cancelAnimationFrame(flightFrameRef.current)
        flightFrameRef.current = null
      }
    }
  }, [currentAdminStatus, currentCustomerStatus, flightDuration, statusChangeTime])

  // ----- Animation: return leg -----
  useEffect(() => {
    if (currentAdminStatus !== 'returning') {
      if (returnFrameRef.current) {
        cancelAnimationFrame(returnFrameRef.current)
        returnFrameRef.current = null
      }
      setReturnProgress(0)
      return
    }

    const durationMs = returnDuration * 1000
    const startTime = statusChangeTime || (returnETA ? new Date(returnETA).getTime() - durationMs : Date.now())

    const animate = () => {
      const elapsed = Date.now() - startTime
      const ratio = clamp(elapsed / durationMs)
      setReturnProgress(ratio)
      if (ratio < 1) {
        returnFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (returnFrameRef.current) {
        cancelAnimationFrame(returnFrameRef.current)
        returnFrameRef.current = null
      }
    }
  }, [currentAdminStatus, returnDuration, returnETA, statusChangeTime])

  const stepsSpan = Math.max(1, ADMIN_STEPS.length - 1)
  const perStep = 1 / stepsSpan
  const activeIndex = Math.max(0, ADMIN_STEPS.findIndex((step) => step.value === currentAdminStatus))
  const deliveredIndex = ADMIN_STEPS.findIndex((step) => step.value === 'delivered')
  const returningIndex = ADMIN_STEPS.findIndex((step) => step.value === 'returning')

  let progressUnits = activeIndex * perStep
  if (currentAdminStatus === 'flying') {
    const previousStep = Math.max(0, activeIndex - 1)
    progressUnits = previousStep * perStep + flightProgress * perStep
  } else if (currentAdminStatus === 'returning') {
    const previousStep = Math.max(0, returningIndex - 1)
    progressUnits = previousStep * perStep + returnProgress * perStep
  } else if (currentAdminStatus === 'delivered' && deliveredIndex >= 0) {
    progressUnits = deliveredIndex * perStep
  }
  const progressPercent = clamp(progressUnits, 0, 1) * 100

  const etaTimestamp = currentAdminStatus === 'flying'
    ? (statusChangeTime ? statusChangeTime + flightDuration * 1000 : null)
    : currentAdminStatus === 'returning'
      ? (returnETA ? new Date(returnETA).getTime() : statusChangeTime ? statusChangeTime + returnDuration * 1000 : null)
      : null

  const routeProgress = currentAdminStatus === 'returning'
    ? 1 - returnProgress
    : currentAdminStatus === 'delivered'
      ? 1
      : currentAdminStatus === 'flying'
        ? flightProgress
        : 0

  const dronePosition = useMemo(() => (
    hasLocations ? interpolatePosition(restaurantLocation, customerLocation, routeProgress) : null
  ), [hasLocations, restaurantLocation, customerLocation, routeProgress])

  const bounds = useMemo(() => {
    if (!hasLocations) {
      return null
    }
    return [
      [restaurantLocation.lat, restaurantLocation.lng],
      [customerLocation.lat, customerLocation.lng]
    ]
  }, [hasLocations, restaurantLocation, customerLocation])

  const markerIcons = useMemo(() => ({
    restaurant: buildIcon('drone-marker--restaurant', 'R'),
    customer: buildIcon('drone-marker--customer', 'C'),
    drone: buildIcon('drone-marker--drone', 'D')
  }), [])

  return (
    <div className='drone-tracker'>
      <div className='drone-tracker__header'>
        <div>
          <p className='drone-tracker__label'>Fleet status</p>
          <h4>{ADMIN_STATUS_LABELS[currentAdminStatus]?.label || currentAdminStatus}</h4>
          {etaTimestamp && (
            <p className='drone-tracker__eta'>ETA: {formatEta(etaTimestamp)}</p>
          )}
        </div>
      </div>

      <div className='drone-tracker__steps'>
        {ADMIN_STEPS.map((step, index) => {
          const reached = index <= activeIndex
          return (
            <div key={step.value} className={`drone-step ${reached ? 'drone-step--active' : ''}`}>
              <span className='drone-step__bullet' />
              <div className='drone-step__copy'>
                <strong>{step.label}</strong>
                <small>{step.description}</small>
              </div>
            </div>
          )
        })}
      </div>

      <div className='drone-tracker__progress'>
        <div className='drone-tracker__progress-bar'>
          <div className='drone-tracker__progress-value' style={{ width: `${progressPercent}%` }} />
        </div>
        <span>{Math.round(progressPercent)}%</span>
      </div>

      <div className='drone-tracker__map'>
        {hasLocations ? (
          <MapContainer
            className='drone-map'
            zoom={13}
            scrollWheelZoom={false}
            bounds={bounds}
            boundsOptions={{ padding: [32, 32] }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={markerIcons.restaurant} />
            <Marker position={[customerLocation.lat, customerLocation.lng]} icon={markerIcons.customer} />
            {dronePosition && <Marker position={[dronePosition.lat, dronePosition.lng]} icon={markerIcons.drone} />}
            <Polyline positions={bounds} color='#2563eb' dashArray={currentAdminStatus === 'awaiting-drone' ? '4 6' : '0'} />
          </MapContainer>
        ) : (
          <p className='drone-tracker__map-hint'>Location data pending. We will display the route once available.</p>
        )}
      </div>
    </div>
  )
}

export default DroneTracker
