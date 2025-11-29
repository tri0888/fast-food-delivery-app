import droneModel from '../../../models/droneModel.js'
import orderModel from '../../../models/orderModel.js'
import restaurantModel from '../../../models/restaurantModel.js'
import AppError from '../../../utils/appError.js'

const MIN_DURATION_SECONDS     = Number(process.env.DRONE_ANIMATION_MIN_SECONDS || 30)
const DEFAULT_FLIGHT_SECONDS   = Number(process.env.DRONE_ANIMATION_SECONDS || 180)
const DEFAULT_DRONE_SPEED_KMH  = Number(process.env.DRONE_SPEED_KMH || 100)

const returnTimers = new Map()

const statusHistoryEntry = (status) => ({ status, at: new Date() })
const toRadians = (deg) => (deg * Math.PI) / 180

const hasCoordinates = (coords) => typeof coords?.lat === 'number' && typeof coords?.lng === 'number'

const haversineDistanceKm = (start, end) => {
    if (!hasCoordinates(start) || !hasCoordinates(end)) {
        return null
    }
    const R = 6371
    const dLat = toRadians(end.lat - start.lat)
    const dLon = toRadians(end.lng - start.lng)
    const lat1 = toRadians(start.lat)
    const lat2 = toRadians(end.lat)

    const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Number((R * c).toFixed(3))
}

const computeFlightMetrics = (restaurantLocation, customerLocation) => {
    const distanceKm = haversineDistanceKm(restaurantLocation, customerLocation)
    const speedKmh = DEFAULT_DRONE_SPEED_KMH

    if (!distanceKm || distanceKm <= 0) {
        return {
            distanceKm: null,
            durationSec: Math.max(MIN_DURATION_SECONDS, DEFAULT_FLIGHT_SECONDS),
            speedKmh
        }
    }

    const seconds = Math.round((distanceKm / Math.max(0.1, speedKmh)) * 3600)
    return {
        distanceKm,
        durationSec: Math.max(MIN_DURATION_SECONDS, seconds),
        speedKmh
    }
}

const normalizeCoords = (coords, fallbackLabel) => {
    if (!hasCoordinates(coords)) {
        return null
    }
    return {
        lat: Number(coords.lat),
        lng: Number(coords.lng),
        label: coords.label || fallbackLabel || 'Location',
        confirmed: Boolean(coords.confirmed),
        confirmedAt: coords.confirmedAt ? new Date(coords.confirmedAt) : null
    }
}

const resolveRestaurantLocation = async (restaurantId) => {
    const restaurant = await restaurantModel.findById(restaurantId)
    if (!restaurant) {
        return { lat: 0, lng: 0, label: 'Restaurant' }
    }

    const { location = {}, name, address } = restaurant
    const normalized = normalizeCoords(location, name || address || 'Restaurant')
    if (normalized) {
        return normalized
    }

    return { lat: 0, lng: 0, label: address || name || 'Restaurant' }
}

const buildTrackingUpdate = (overrides = {}) => ({
    'droneTracking.lastUpdated': new Date(),
    ...overrides
})

const pushHistory = (status) => ({ 'droneTracking.history': statusHistoryEntry(status) })

const applyOrderUpdate = async (orderId, setUpdate, historyStatus) => {
    const updateDoc = { $set: buildTrackingUpdate(setUpdate) }
    if (historyStatus) {
        updateDoc.$push = pushHistory(historyStatus)
    }
    return orderModel.findByIdAndUpdate(orderId, updateDoc, { new: true })
}

const ensureCustomerLocation = (orderDoc) => {
    if (!orderDoc) {
        return null
    }
    const fromTracking = normalizeCoords(orderDoc.droneTracking?.customerLocation, 'Customer drop-off')
    const fromAddress = normalizeCoords(orderDoc.address?.location, 'Customer drop-off')
    return fromTracking || fromAddress
}

const scheduleReturnTimer = (droneId, eta) => {
    const key = droneId.toString()
    const delay = Math.max(0, eta - Date.now())
    if (returnTimers.has(key)) {
        clearTimeout(returnTimers.get(key))
    }
    const handler = setTimeout(() => finalizeDroneReturn(key).catch(() => {}), delay)
    returnTimers.set(key, handler)
}

const resetDroneToIdle = async (droneId) => {
    if (!droneId) {
        return null
    }
    const key = droneId.toString()
    if (returnTimers.has(key)) {
        clearTimeout(returnTimers.get(key))
        returnTimers.delete(key)
    }
    return droneModel.findOneAndUpdate(
        { _id: droneId },
        { status: 'idle', currentOrder: null, lastStatusChange: new Date(), returnETA: null },
        { new: true }
    )
}

export const dispatchDroneFlight = async ({ order, droneId }) => {
    const orderDoc = typeof order?.toObject === 'function' ? order : await orderModel.findById(order)
    if (!orderDoc) {
        throw new AppError('Order not found', 404)
    }

    const customerLocation = ensureCustomerLocation(orderDoc)
    if (!customerLocation || !customerLocation.confirmed) {
        throw new AppError('Customer location has not been confirmed on the map yet', 422)
    }

    const drone = await droneModel.findById(droneId)
    if (!drone) {
        throw new AppError('Drone not found', 404)
    }

    if (drone.status !== 'idle' || drone.currentOrder) {
        throw new AppError('Selected drone is not idle', 409)
    }

    if (drone.res_id.toString() !== orderDoc.res_id.toString()) {
        throw new AppError('Drone belongs to another restaurant', 400)
    }

    const restaurantCoords = await resolveRestaurantLocation(orderDoc.res_id)
    const { distanceKm, durationSec, speedKmh } = computeFlightMetrics(restaurantCoords, customerLocation)
    const now = new Date()

    await droneModel.findByIdAndUpdate(droneId, {
        status: 'flying',
        currentOrder: orderDoc._id,
        lastStatusChange: now,
        returnETA: null
    })

    const confirmedCustomerLocation = {
        ...customerLocation,
        confirmed: true,
        confirmedAt: customerLocation.confirmedAt || now
    }

    return applyOrderUpdate(orderDoc._id, {
        'droneTracking.assignedDrone': droneId,
        'droneTracking.status': 'flying',
        'droneTracking.adminStatus': 'flying',
        'droneTracking.awaitingSince': null,
        'droneTracking.restaurantLocation': restaurantCoords,
        'droneTracking.customerLocation': confirmedCustomerLocation,
        'droneTracking.animationDurationSec': durationSec,
        'droneTracking.flightDistanceKm': distanceKm,
        'droneTracking.speedKmh': speedKmh
    }, 'flying')
}

const finalizeDroneReturn = async (droneId) => {
    returnTimers.delete(droneId)
    return droneModel.findOneAndUpdate(
        { _id: droneId },
        { status: 'idle', currentOrder: null, lastStatusChange: new Date(), returnETA: null },
        { new: true }
    )
}

export const markDroneDelivered = async (orderId) => {
    const order = await orderModel.findById(orderId)
    if (!order || !order.droneTracking?.assignedDrone) {
        return null
    }

    const flightDurationSec = order.droneTracking?.animationDurationSec || DEFAULT_FLIGHT_SECONDS
    const returnDurationSec = flightDurationSec

    await applyOrderUpdate(orderId, {
        'droneTracking.status': 'delivered',
        'droneTracking.adminStatus': 'returning',
        'droneTracking.returnDurationSec': returnDurationSec
    }, 'delivered')

    const eta = Date.now() + returnDurationSec * 1000
    await droneModel.findByIdAndUpdate(order.droneTracking.assignedDrone, {
        status: 'returning',
        lastStatusChange: new Date(),
        returnETA: new Date(eta)
    })

    scheduleReturnTimer(order.droneTracking.assignedDrone.toString(), eta)
    return order
}

export const hydrateReturningDrones = async () => {
    const returningDrones = await droneModel.find({ status: 'returning' })
    const now = Date.now()
    await Promise.all(returningDrones.map(async (drone) => {
        const eta = drone.returnETA ? drone.returnETA.getTime() : now
        if (eta <= now) {
            await finalizeDroneReturn(drone._id.toString())
        } else {
            scheduleReturnTimer(drone._id.toString(), eta)
        }
    }))
}

export const releaseDroneAndAssignNext = async (droneId) => finalizeDroneReturn(droneId)

export const releaseDroneToIdle = async (droneId) => resetDroneToIdle(droneId)

export const getVisibleDroneState = (tracking = {}) => ({
    customerStatus: tracking.status || 'awaiting-drone',
    adminStatus: tracking.adminStatus || tracking.status || 'awaiting-drone'
})
// *** End of File