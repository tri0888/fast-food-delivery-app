import foodService from './Service.js'


const listFood = async (req, res, next) => {
    try {
        // Pass restaurant filter from middleware
        const filter = req.restaurantFilter || {};
        const foods = await foodService.getAllFoods(filter)        
        res.json({success : true,
                  data    : foods})

    } catch (error) {
        return next(error)
    }
}

export {listFood}