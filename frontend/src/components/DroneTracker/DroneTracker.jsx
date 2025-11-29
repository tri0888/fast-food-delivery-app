import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './DroneTracker.css'
import { toast } from 'react-toastify'

// ----- Setup helpers -----
const DRONE_STEPS = [
    { value: 'awaiting-drone', label: 'Awaiting drone', description: 'Waiting for an idle drone' },
    { value: 'flying', label: 'En route', description: 'Drone is headed to your pin' },
    { value: 'delivered', label: 'Delivered', description: 'Package delivered' }
]

const statusLabels = DRONE_STEPS.reduce((acc, step) => {
    acc[step.value] = step
    return acc
}, {})

const isValidCoordinate = (value) => typeof value?.lat === 'number' && typeof value?.lng === 'number'

const interpolatePosition = (start, end, ratio) => {
    if (!isValidCoordinate(start) || !isValidCoordinate(end)) {
        return null
    }
    const clampRatio = Math.min(1, Math.max(0, ratio))
    return {
        lat: start.lat + (end.lat - start.lat) * clampRatio,
        lng: start.lng + (end.lng - start.lng) * clampRatio
    }
}

const buildIcon = (className, label) => L.divIcon({
    className: `drone-marker ${className}`,
    html: `<span>${label}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
})

const DEFAULT_ANIMATION_SECONDS = Number(import.meta.env.VITE_DRONE_ANIMATION_DURATION_SEC || import.meta.env.VITE_DRONE_ANIMATION_FALLBACK_SEC || 30)
const MIN_ANIMATION_SECONDS = 30

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const clampDuration = (value, fallback = DEFAULT_ANIMATION_SECONDS) => {
    const numeric = Number(value)
    if (!Number.isFinite(numeric) || numeric <= 0) {
        return Math.max(MIN_ANIMATION_SECONDS, fallback)
    }
    return Math.max(MIN_ANIMATION_SECONDS, numeric)
}

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

const DroneTracker = ({ tracking, enableNotifications = true }) => {
    if (!tracking) {
        return <div className="drone-tracker__empty">Tracking data will appear once the order is confirmed.</div>
    }

    const currentStatus = tracking.status || 'awaiting-drone'
    const activeIndex = Math.max(0, DRONE_STEPS.findIndex((step) => step.value === currentStatus))
    const animationDurationSec = clampDuration(tracking.animationDurationSec)
    const statusChangeTime = tracking.lastUpdated ? new Date(tracking.lastUpdated).getTime() : null

    const [flightProgress, setFlightProgress] = useState(currentStatus === 'delivered' ? 1 : 0)
    const animationFrameRef = useRef(null)
    const arrivalToastRef = useRef(false)
    const deliveredToastRef = useRef(false)

    // ----- Animation: flight leg -----
    useEffect(() => {
        if (currentStatus !== 'flying') {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
            }
            setFlightProgress(currentStatus === 'delivered' ? 1 : 0)
            arrivalToastRef.current = false
            if (currentStatus === 'awaiting-drone') {
                deliveredToastRef.current = false
            }
            return
        }

        const durationMs = animationDurationSec * 1000
        const startTime = statusChangeTime || Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const ratio = clamp(elapsed / durationMs)
            setFlightProgress(ratio)
            if (ratio < 1) {
                animationFrameRef.current = requestAnimationFrame(animate)
            } else if (!arrivalToastRef.current) {
                arrivalToastRef.current = true
                if (enableNotifications) {
                    toast.info('Your drone is approaching the drop-off point ✈️')
                }
            }
        }

        animate()

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
            }
        }
    }, [currentStatus, animationDurationSec, statusChangeTime, enableNotifications])

    // ----- Notifications -----
    useEffect(() => {
        if (!enableNotifications) {
            return
        }
        if (currentStatus === 'delivered' && !deliveredToastRef.current) {
            deliveredToastRef.current = true
            // toast.success('Your drone has arrived. Enjoy your meal! 🚀')
        }
        if (currentStatus === 'flying') {
            deliveredToastRef.current = false
        }
    }, [currentStatus, enableNotifications])

    const stepsSpan = Math.max(1, DRONE_STEPS.length - 1)
    let progressUnits = activeIndex / stepsSpan
    if (currentStatus === 'flying') {
        progressUnits = flightProgress
    } else if (currentStatus === 'delivered') {
        progressUnits = 1
    }
    const progressPercent = clamp(progressUnits, 0, 1) * 100

    const etaTimestamp = currentStatus === 'flying' && statusChangeTime
        ? statusChangeTime + animationDurationSec * 1000
        : null

    const restaurantLocation = tracking.restaurantLocation
    const customerLocation = tracking.customerLocation
    const hasLocations = isValidCoordinate(restaurantLocation) && isValidCoordinate(customerLocation)

    const routeProgress = currentStatus === 'delivered' ? 1 : currentStatus === 'flying' ? flightProgress : 0

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

    const awaitingMessage = currentStatus === 'awaiting-drone'
        ? 'All drones are currently busy. We will dispatch one as soon as it returns.'
        : ''
    
    const flightDistanceKm = tracking.flightDistanceKm
    const flightDurationMinutes = tracking.animationDurationSec
        ? Math.round((tracking.animationDurationSec / 60) * 10) / 10
        : null
    const speedKmh = tracking.speedKmh

    return (
        <div className="drone-tracker">
            <div className="drone-tracker__header">
                <div>
                    <p className="drone-tracker__label">Drone status</p>
                    <h4>{statusLabels[currentStatus]?.label || 'Awaiting drone'}</h4>
                    {!!awaitingMessage && <p className="drone-tracker__hint">{awaitingMessage}</p>}
                    {etaTimestamp && (
                        <p className="drone-tracker__eta">ETA: {formatEta(etaTimestamp)}</p>
                    )}
                    <div className="drone-tracker__metrics">
                        <div>
                            <small>Distance</small>
                            <strong>{flightDistanceKm ? `${flightDistanceKm.toFixed(2)} km` : 'Pending'}</strong>
                        </div>
                        <div>
                            <small>Speed</small>
                            <strong>{speedKmh ? `${speedKmh} km/h` : 'Pending'}</strong>
                        </div>
                        <div>
                            <small>Flight time</small>
                            <strong>{flightDurationMinutes ? `${flightDurationMinutes} min` : 'Pending'}</strong>
                        </div>
                    </div>
                </div>
                {tracking.assignedDrone?.name && (
                    <p className="drone-tracker__drone-name">{tracking.assignedDrone.name}</p>
                )}
            </div>

            <div className="drone-tracker__steps">
                {DRONE_STEPS.map((step, index) => {
                    const reached = index <= activeIndex
                    return (
                        <div key={step.value} className={`drone-step ${reached ? 'drone-step--active' : ''}`}>
                            <span className="drone-step__bullet" />
                            <div className="drone-step__copy">
                                <strong>{step.label}</strong>
                                <small>{step.description}</small>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="drone-tracker__progress">
                <div className="drone-tracker__progress-bar">
                    <div className="drone-tracker__progress-value" style={{ width: `${progressPercent}%` }} />
                </div>
                <span>{Math.round(progressPercent)}%</span>
            </div>

            <div className="drone-tracker__map">
                {hasLocations ? (
                    <MapContainer
                        className="drone-map"
                        zoom={13}
                        scrollWheelZoom={false}
                        bounds={bounds}
                        boundsOptions={{ padding: [32, 32] }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={markerIcons.restaurant} />
                        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={markerIcons.customer} />
                        {dronePosition && <Marker position={[dronePosition.lat, dronePosition.lng]} icon={markerIcons.drone} />}
                        <Polyline positions={bounds} color="#4f46e5" dashArray={currentStatus === 'awaiting-drone' ? '4 6' : '0'} />
                    </MapContainer>
                ) : (
                    <p className="drone-tracker__map-hint">Location data pending. We will display the route once available.</p>
                )}
            </div>
        </div>
    )
}

export default DroneTracker
