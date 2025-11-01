import foodService from './Service.js'


const listFood = async (req, res, next) => {
    try {
        const foods = await foodService.getAllFoods()        
        res.json({success : true,
                  data    : foods})

    } catch (error) {
        return next(error)
    }
}

export {listFood}