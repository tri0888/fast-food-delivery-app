import orderRepository from './Repository.js'
import AppError from '../../../utils/appError.js'

class OrderService {
    async verifyOrder(orderId, success) {
        if (!orderId) {
            throw new AppError('Order ID is required', 400)
        }

        if (success === "true") {
            // Payment successful - update order payment status
            await orderRepository.updatePaymentStatus(orderId, true)
            return { success: true, message: "Paid" }
        } else {
            // Payment failed - delete order and restore stock
            const order = await orderRepository.findById(orderId)
            
            if (order) {
                // Restore stock for all items
                await orderRepository.restoreStock(order.items)
                
                // Delete the order
                await orderRepository.deleteById(orderId)
            }
            
            return { success: false, message: "Not Paid" }
        }
    }
}

export default new OrderService()
