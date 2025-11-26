import listDronesService from './Service.js'

const listDrones = async (req, res, next) => {
    try {
        const filter = req.restaurantFilter || {}
        const drones = await listDronesService.list(filter)

        res.json({
            success: true,
            data: drones
        })
    } catch (error) {
        next(error)
    }
}

export { listDrones }
