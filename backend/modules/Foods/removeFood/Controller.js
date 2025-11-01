import foodService from './Service.js'

const removeFood = async (req, res, next) => {
    try {
        await foodService.deleteFood(req.body.id)    
        res.json({success : true,
                  message : 'Food Removed'})

    } catch (error) {
        return next(error)
    }
}

export {removeFood}