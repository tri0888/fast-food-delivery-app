import mongoose from 'mongoose';

const DRONE_STATUSES   = ['idle', 'preparing', 'flying', 'delivered', 'returning']

const drone = new mongoose.Schema({name   : {type     : String,
                                             required : [true, 'Drone must include a name']},
                                   res_id : {type     : mongoose.Schema.ObjectId,
                                             ref      : 'Restaurant',
                                             required : [true, 'Drone must belong to a restaurant']},
                                   status : {type     : String,
                                             enum     : DRONE_STATUSES,
                                             default  : 'idle'}})
                                               
const droneModel = mongoose.models.drone || mongoose.model("drone", drone)

export default droneModel;