import orderRepository from './Repository.js'
import AppError from '../../../utils/appError.js'
import { markDroneFlying, releaseDroneToIdle } from '../droneTracking/droneTrackingService.js'

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

class OrderService {
    async updateOrderStatus(orderId, status) {

        const order = await orderRepository.findOrderById(orderId)
        if (!order) {
            throw new AppError('Order not found', 404)
        }

        if (!status) {
            throw new AppError('Status is required', 400)
        }

        const currentStatus = normalizeStatus(order.status)
        const allowedStatuses = STATUS_TRANSITIONS[currentStatus] || []
        if (!allowedStatuses.includes(status)) {
            throw new AppError('Invalid status transition', 400)
        }

        if (status !== 'Cancelled' && !['authorized', 'captured'].includes(order.paymentStatus)) {
            throw new AppError('Cannot advance order before payment authorization', 400)
        }

        if (status === 'Out for delivery') {
            const droneUpdate = await markDroneFlying(orderId)
            if (!droneUpdate) {
                throw new AppError('No idle drone available yet. Please wait for a returning drone.', 409)
            }
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
            }
            return updatedOrder
        }

        return await orderRepository.updateStatus(orderId, status)
    }
}

export default new OrderService()
