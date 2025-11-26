import crypto from 'crypto'
import orderRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import stripeAdapter from '../../Payment/stripeAdapter.js'
import { attachDroneToOrder } from '../droneTracking/droneTrackingService.js'

const DELIVERY_FEE = 2
const checkoutLocks = new Map()
const checkoutResultCache = new Map()
const CHECKOUT_CACHE_TTL_MS = Number(process.env.CHECKOUT_CACHE_TTL_MS || 5000)

const rememberCheckoutResult = (key, value) => {
    checkoutResultCache.set(key, { value, expiresAt: Date.now() + CHECKOUT_CACHE_TTL_MS })
}

const readCheckoutCache = (key) => {
    const cached = checkoutResultCache.get(key)
    if (!cached) {
        return null
    }
    if (cached.expiresAt <= Date.now()) {
        checkoutResultCache.delete(key)
        return null
    }
    return cached.value
}

class OrderService {
    async placeOrder(userId, items, amount, address, frontendUrl) {
        const lockKey = userId ? userId.toString() : ''
        if (!lockKey) {
            throw new AppError('User context is required', 400)
        }

        const cachedResult = readCheckoutCache(lockKey)
        if (cachedResult) {
            return cachedResult
        }

        const inFlight = checkoutLocks.get(lockKey)
        if (inFlight) {
            return inFlight
        }

        const checkoutPromise = this._executePlaceOrder(userId, items, amount, address, frontendUrl)
            .then((result) => {
                rememberCheckoutResult(lockKey, result)
                return result
            })
            .finally(() => {
                checkoutLocks.delete(lockKey)
            })

        checkoutLocks.set(lockKey, checkoutPromise)
        return checkoutPromise
    }

    async _executePlaceOrder(userId, items, amount, address, frontendUrl) {
        const user = await orderRepository.findUserById(userId)
        if (!user) {
            throw new AppError('User not found', 404)
        }

        if (!address) {
            throw new AppError('Please provide delivery information', 400)
        }

        if (!Array.isArray(items) || items.length === 0) {
            throw new AppError('Order must contain at least one item', 400)
        }

        const normalizedItems = items.map((item) => ({
            foodId: item.foodId || item._id,
            quantity: Number(item.quantity) || 0
        }))

        normalizedItems.forEach((item) => {
            if (!item.foodId) {
                throw new AppError('Food reference is required for each item', 400)
            }
            if (item.quantity <= 0) {
                throw new AppError('Quantity must be greater than zero', 400)
            }
        })

        const foodIds = normalizedItems.map((item) => item.foodId)
        const foods = await orderRepository.findFoodsByIds(foodIds)
        const foodsMap = new Map(foods.map((food) => [food._id.toString(), food]))

        const restaurantGroups = new Map()
        const checkoutItems = []
        const reservations = new Map()
        let subtotal = 0

        for (const item of normalizedItems) {
            const food = foodsMap.get(item.foodId.toString())
            if (!food) {
                throw new AppError('Some menu items are no longer available', 400)
            }

            if (food.stock < item.quantity) {
                throw new AppError(`Insufficient stock for ${food.name}`, 400)
            }

            subtotal += food.price * item.quantity
            checkoutItems.push({
                name: food.name,
                price: food.price,
                quantity: item.quantity
            })

            const currentReservation = reservations.get(food._id.toString()) || 0
            reservations.set(food._id.toString(), currentReservation + item.quantity)

            const restaurantKey = food.res_id.toString()
            if (!restaurantGroups.has(restaurantKey)) {
                restaurantGroups.set(restaurantKey, {
                    restaurantId: food.res_id,
                    items: [],
                    amount: 0
                })
            }

            const group = restaurantGroups.get(restaurantKey)
            group.items.push({
                foodId: food._id,
                name: food.name,
                quantity: item.quantity,
                price: food.price,
                image: food.image
            })
            group.amount += food.price * item.quantity
        }

        if (checkoutItems.length === 0) {
            throw new AppError('Unable to create checkout session without items', 400)
        }

        const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0
        const expectedTotal = subtotal + deliveryFee

        if (typeof amount === 'number' && amount > 0) {
            const delta = Math.abs(amount - expectedTotal)
            if (delta > 0.01) {
                throw new AppError('Order total mismatch. Please refresh and try again.', 400)
            }
        }

        const reservationEntries = Array.from(reservations.entries()).map(([foodId, quantity]) => ({
            foodId,
            quantity
        }))

        for (const reservation of reservationEntries) {
            const reserved = await orderRepository.reserveStock(reservation.foodId, reservation.quantity)
            if (!reserved) {
                throw new AppError('Another customer purchased these items first. Please refresh the page.', 400)
            }
        }

        const orderPayloads = Array.from(restaurantGroups.values()).map((group) => ({
            userId,
            res_id: group.restaurantId,
            amount: group.amount,
            address,
            food_items: group.items,
            status: 'Pending Confirmation',
            paymentStatus: 'pending'
        }))

        const checkoutId = `chk_${crypto.randomBytes(8).toString('hex')}`
        let createdOrders = []

        try {
            createdOrders = await orderRepository.createOrders(orderPayloads)
            const orderIds = createdOrders.map((order) => order._id.toString())
            const orderIdsValue = orderIds.join(',')
            const encodedOrderIds = encodeURIComponent(orderIdsValue)

            await Promise.all(createdOrders.map((order) => attachDroneToOrder(order)))

            const { url: sessionUrl, sessionId, paymentIntentId } = await stripeAdapter.createCheckoutSession({
                referenceId: checkoutId,
                orderIdsParam: encodedOrderIds,
                rawOrderIds: orderIdsValue,
                items: checkoutItems,
                frontendUrl,
                deliveryFee,
                metadata: {
                    user_id: userId,
                    checkout_id: checkoutId
                }
            })

            await orderRepository.attachStripeDetails(orderIds, {
                sessionId,
                paymentIntentId
            })

            return { session_url: sessionUrl }
        } catch (error) {
            if (createdOrders.length > 0) {
                const rollbackIds = createdOrders.map((order) => order._id)
                await orderRepository.deleteOrders(rollbackIds)
            }
            await orderRepository.restoreStock(reservationEntries)
            throw error
        }
    }
}

export default new OrderService()
