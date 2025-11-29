import listDronesService from './Service.js'

const listDrones = async (req, res, next) => {
    try {
        const filter = { ...(req.restaurantFilter || {}) }
        if (req.query?.status) {
            filter.status = req.query.status
        }
        if (req.query?.res_id) {
            filter.res_id = req.query.res_id
        }
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
