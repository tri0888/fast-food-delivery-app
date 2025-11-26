import droneModel from '../../../models/droneModel.js'
import orderModel from '../../../models/orderModel.js'
import restaurantModel from '../../../models/restaurantModel.js'

const MIN_CUSTOMER_DISTANCE_KM = Number(process.env.DRONE_CUSTOMER_DISTANCE_MIN_KM || 2)
const MAX_CUSTOMER_DISTANCE_KM = Number(process.env.DRONE_CUSTOMER_DISTANCE_MAX_KM || 5)
const MIN_DURATION_SECONDS     = Number(process.env.DRONE_ANIMATION_MIN_SECONDS || 30)
const FIXED_ANIMATION_SECONDS  = Number(process.env.DRONE_ANIMATION_SECONDS || 30)

const computeAnimationSeconds = (distanceKm = MIN_CUSTOMER_DISTANCE_KM) => {
    const droneSpeedKmh = Number(process.env.DRONE_SPEED_KMH || 60)
    const seconds = (distanceKm / Math.max(1, droneSpeedKmh)) * 3600
    return Math.round(Math.max(MIN_DURATION_SECONDS, seconds))
}

// Toggle the option you prefer: comment out the line you are NOT using.
const DRONE_ANIMATION_SECONDS =
    // computeAnimationSeconds(MAX_CUSTOMER_DISTANCE_KM)
    FIXED_ANIMATION_SECONDS

const returnTimers = new Map()

const statusHistoryEntry = (status) => ({ status, at: new Date() })

const toRadians = (deg) => (deg * Math.PI) / 180
const toDegrees = (rad) => (rad * 180) / Math.PI

const randomCustomerDestination = (restaurantLocation) => {
    const base = restaurantLocation || { lat: 0, lng: 0, label: 'Unknown' }
    const distance = MIN_CUSTOMER_DISTANCE_KM + Math.random() * (MAX_CUSTOMER_DISTANCE_KM - MIN_CUSTOMER_DISTANCE_KM)
    const bearing = Math.random() * 2 * Math.PI
    const earthRadiusKm = 6371

    const lat1 = toRadians(base.lat || 0)
    const lon1 = toRadians(base.lng || 0)

    const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(distance / earthRadiusKm) +
        Math.cos(lat1) * Math.sin(distance / earthRadiusKm) * Math.cos(bearing)
    )

    const lon2 = lon1 + Math.atan2(
        Math.sin(bearing) * Math.sin(distance / earthRadiusKm) * Math.cos(lat1),
        Math.cos(distance / earthRadiusKm) - Math.sin(lat1) * Math.sin(lat2)
    )

    return {
        lat: Number(toDegrees(lat2).toFixed(6)),
        lng: Number(toDegrees(lon2).toFixed(6)),
        label: 'Customer drop-off'
    }
}

const resolveRestaurantLocation = async (restaurantId) => {
    const restaurant = await restaurantModel.findById(restaurantId)
    if (!restaurant) {
        return { lat: 0, lng: 0, label: 'Restaurant' }
    }

    const { location = {}, name, address } = restaurant
    if (typeof location?.lat === 'number' && typeof location?.lng === 'number') {
        return { lat: location.lat, lng: location.lng, label: location.label || name || 'Restaurant' }
    }

    return { lat: 0, lng: 0, label: address || name || 'Restaurant' }
}

const buildTrackingUpdate = (overrides = {}) => ({
    'droneTracking.animationDurationSec': DRONE_ANIMATION_SECONDS,
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

const updateAwaitingState = async (order, restaurantCoords, customerCoords) => {
    await applyOrderUpdate(order._id, {
        'droneTracking.status': 'awaiting-drone',
        'droneTracking.adminStatus': 'awaiting-drone',
        'droneTracking.awaitingSince': order.droneTracking?.awaitingSince || new Date(),
        'droneTracking.restaurantLocation': restaurantCoords,
        'droneTracking.customerLocation': customerCoords
    }, 'awaiting-drone')
}

const markPreparingState = async (orderId, droneId, restaurantCoords, customerCoords) => {
    return applyOrderUpdate(orderId, {
        'droneTracking.assignedDrone': droneId,
        'droneTracking.status': 'preparing',
        'droneTracking.adminStatus': 'preparing',
        'droneTracking.awaitingSince': null,
        'droneTracking.restaurantLocation': restaurantCoords,
        'droneTracking.customerLocation': customerCoords
    }, 'preparing')
}

const scheduleReturnTimer = (droneId, eta) => {
    const delay = Math.max(0, eta - Date.now())
    if (returnTimers.has(droneId)) {
        clearTimeout(returnTimers.get(droneId))
    }
    const handler = setTimeout(() => finalizeDroneReturn(droneId).catch(() => {}), delay)
    returnTimers.set(droneId, handler)
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

export const attachDroneToOrder = async (orderInput) => {
    const order = typeof orderInput?.toObject === 'function' ? orderInput : await orderModel.findById(orderInput)
    if (!order) {
        return null
    }

    const restaurantCoords = await resolveRestaurantLocation(order.res_id)
    const customerCoords = order.droneTracking?.customerLocation || randomCustomerDestination(restaurantCoords)
    const now = new Date()

    const drone = await droneModel.findOneAndUpdate(
        { res_id: order.res_id, status: 'idle', currentOrder: null },
        { status: 'preparing', currentOrder: order._id, lastStatusChange: now, returnETA: null },
        { new: true }
    )

    if (!drone) {
        await updateAwaitingState(order, restaurantCoords, customerCoords)
        return null
    }

    return markPreparingState(order._id, drone._id, restaurantCoords, customerCoords)
}

export const ensureDroneForOrder = async (orderId) => {
    const order = await orderModel.findById(orderId)
    if (!order) {
        return null
    }

    if (order.droneTracking?.assignedDrone) {
        return order
    }

    return attachDroneToOrder(order)
}

export const markDroneFlying = async (orderId) => {
    const order = await ensureDroneForOrder(orderId)
    if (!order || !order.droneTracking?.assignedDrone) {
        return null
    }
    await droneModel.findByIdAndUpdate(order.droneTracking.assignedDrone, {
        status: 'flying',
        lastStatusChange: new Date()
    })
    return applyOrderUpdate(orderId, {
        'droneTracking.status': 'flying',
        'droneTracking.adminStatus': 'flying'
    }, 'flying')
}

const finalizeDroneReturn = async (droneId) => {
    returnTimers.delete(droneId)
    const drone = await droneModel.findOneAndUpdate(
        { _id: droneId },
        { status: 'idle', currentOrder: null, lastStatusChange: new Date(), returnETA: null },
        { new: true }
    )

    if (!drone) {
        return null
    }

    return assignDroneToPendingOrder(drone)
}

const assignDroneToPendingOrder = async (drone) => {
    const pendingOrder = await orderModel.findOne({
        res_id: drone.res_id,
        status: { $nin: ['Cancelled'] },
        'droneTracking.status': 'awaiting-drone'
    }).sort({ 'droneTracking.awaitingSince': 1, createdAt: 1 })

    if (!pendingOrder) {
        return null
    }

    const restaurantCoords = pendingOrder.droneTracking?.restaurantLocation || await resolveRestaurantLocation(pendingOrder.res_id)
    const customerCoords = pendingOrder.droneTracking?.customerLocation || randomCustomerDestination(restaurantCoords)

    await markPreparingState(pendingOrder._id, drone._id, restaurantCoords, customerCoords)
    await droneModel.findByIdAndUpdate(drone._id, {
        status: 'preparing',
        currentOrder: pendingOrder._id,
        lastStatusChange: new Date(),
        returnETA: null
    })

    return orderModel.findById(pendingOrder._id)
}

export const markDroneDelivered = async (orderId) => {
    const order = await orderModel.findById(orderId)
    if (!order || !order.droneTracking?.assignedDrone) {
        return null
    }

    const flightDurationSec = order.droneTracking?.animationDurationSec || DRONE_ANIMATION_SECONDS
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