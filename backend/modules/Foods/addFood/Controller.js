import foodService from './Service.js'

const addFood = async (req, res, next) => {
    try {
        if (req.user && req.user.role === 'admin' && !req.body.res_id) {
            req.body.res_id = req.user.res_id;
        }
        const food = await foodService.createFood(req.body, req.file)
        res.json({success : true,
                  message : 'Food Added',
                  data    : food})

    } catch (error) {
        return next(error)
    }
}

export {addFood}