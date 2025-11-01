import foodService from './Service.js'

const editFood = async (req, res, next) => {
    try {
        const foodId = req.body.id
        const updateData = { ...req.body }    
        
        const food = await foodService.updateFood(foodId, updateData, req.file)
        
        res.json({success : true,
                  message : 'Food updated',
                  data    : food})

    } catch (error) {
        return next(error)
    }
}

export {editFood}