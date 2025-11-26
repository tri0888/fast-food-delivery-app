import droneRepository from '../repository.js'

const DRONE_STATUS_LABELS = {
    idle: 'Idle',
    preparing: 'Preparing',
    flying: 'Flying',
    delivered: 'Delivered',
    returning: 'Returning'
}

const DRONE_CUSTOMER_STEPS = ['awaiting-drone', 'preparing', 'flying', 'delivered']

const computeCustomerProgress = (status) => {
    const index = DRONE_CUSTOMER_STEPS.indexOf(status)
    if (index === -1) {
        return 0
    }
    const span = Math.max(1, DRONE_CUSTOMER_STEPS.length - 1)
    return Math.round((index / span) * 100)
}

class ListDronesService {
    async list(filter = {}) {
        const drones = await droneRepository.findAll(filter)
        const now = Date.now()

        return drones.map((drone) => {
            const statusAgeMinutes = drone.lastStatusChange
                ? Math.round((now - new Date(drone.lastStatusChange).getTime()) / 60000)
                : null

            const currentOrder = drone.currentOrder || null
            if (currentOrder?.droneTracking?.history?.length) {
                currentOrder.droneTracking.history = currentOrder.droneTracking.history.slice(-8)
            }

            return {
                ...drone,
                statusLabel: DRONE_STATUS_LABELS[drone.status] || drone.status,
                statusAgeMinutes,
                customerProgress: computeCustomerProgress(currentOrder?.droneTracking?.status),
                activeOrderId: currentOrder?._id || null
            }
        })
    }
}

export default new ListDronesService()
