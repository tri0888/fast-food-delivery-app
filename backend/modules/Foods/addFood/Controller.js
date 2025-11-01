import foodService from './Service.js'

const addFood = async (req, res, next) => {
    try {
        const food = await foodService.createFood(req.body, req.file)
        res.json({success : true,
                  message : 'Food Added',
                  data    : food})

    } catch (error) {
        return next(error)
    }
}

export {addFood}