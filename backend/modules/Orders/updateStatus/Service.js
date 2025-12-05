import orderRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import { dispatchDroneFlight, releaseDroneToIdle } from '../droneTracking/droneTrackingService.js'

const STATUS_TRANSITIONS = {
    'Pending Confirmation': ['Confirmed', 'Cancelled'],
    'Confirmed': ['Out for delivery'],
    'Out for delivery': [],
    'Delivered': [],
    'Cancelled': []
}

const normalizeStatus = (status) => {
    if (status === 'Food Processing') return 'Pending Confirmation'
    return status
}

const normalizeId = (value) => {
    if (!value) return null
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
        if (value._id) {
            return typeof value._id === 'string' ? value._id : value._id.toString()
        }
        if (value.id) {
            return typeof value.id === 'string' ? value.id : value.id.toString()
        }
        if (typeof value.toString === 'function' && value.toString !== Object.prototype.toString) {
            return value.toString()
        }
    }
    if (typeof value.toString === 'function') {
        return value.toString()
    }
    return null
}

class OrderService {
    async updateOrderStatus(orderId, status, { droneId, user } = {}) {

        const order = await orderRepository.findOrderById(orderId)
        if (!order) {
            throw new AppError('Order not found', 404)
        }

        if (!status) {
            throw new AppError('Status is required', 400)
        }

        const currentStatus = normalizeStatus(order.status)

        if (user?.role === 'superadmin') {
            throw new AppError('Superadmin accounts have read-only access to order statuses', 403)
        }

        if (user?.role === 'admin') {
            const adminRestaurantId = normalizeId(user.res_id)
            if (!adminRestaurantId) {
                throw new AppError('Admin must be assigned to a restaurant to update order statuses', 403)
            }

            const orderRestaurantId = normalizeId(order.res_id)
            if (!orderRestaurantId || orderRestaurantId !== adminRestaurantId) {
                throw new AppError('You can only update orders that belong to your restaurant', 403)
            }
        }

        const allowedStatuses = STATUS_TRANSITIONS[currentStatus] || []
        if (!allowedStatuses.includes(status)) {
            throw new AppError('Invalid status transition', 400)
        }

        if (status !== 'Cancelled' && !['authorized', 'captured'].includes(order.paymentStatus)) {
            throw new AppError('Cannot advance order before payment authorization', 400)
        }

        if (status === 'Out for delivery') {
            if (!droneId) {
                throw new AppError('Please select an idle drone for this order', 400)
            }
            await dispatchDroneFlight({ order, droneId })
        }

        if (status === 'Cancelled') {
            const items = order.food_items || []
            if (items.length > 0) {
                await orderRepository.restoreStock(items)
            }

            const droneAssigned = order.droneTracking?.assignedDrone

            const updatedOrder = await orderRepository.updateStatus(orderId, 'Cancelled', {
                paymentStatus: 'failed',
                stripePaymentIntent: null,
                stripeSessionId: null,
                ...(droneAssigned ? {
                    'droneTracking.assignedDrone': null,
                    'droneTracking.status': 'cancelled',
                    'droneTracking.adminStatus': 'cancelled',
                    'droneTracking.awaitingSince': null
                } : {})
            })
            if (droneAssigned) {
                await releaseDroneToIdle(droneAssigned.toString())
                try {
                    // clear any pending progress notifications for this order
                    const { clearTimersForOrder } = await import('../droneTracking/droneTrackingService.js')
                    if (typeof clearTimersForOrder === 'function') {
                        await clearTimersForOrder(orderId)
                    }
                } catch (e) {
                    // ignore
                }
            }
            return updatedOrder
        }

        return await orderRepository.updateStatus(orderId, status)
    }
}

export default new OrderService()
