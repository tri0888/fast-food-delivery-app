import addDroneService from './Service.js'

const addDrone = async (req, res, next) => {
    try {
        const drone = await addDroneService.create(req.body)
        res.status(201).json({
            success: true,
            data: drone,
            message: 'Drone created successfully'
        })
    } catch (error) {
        next(error)
    }
}

export { addDrone }
