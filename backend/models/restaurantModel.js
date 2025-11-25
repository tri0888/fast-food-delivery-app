import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Restaurant name is required'],
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    permissions: {
        food: {
            add_food: { type: Boolean, default: true },
            edit_food: { type: Boolean, default: true },
            list_food: { type: Boolean, default: true },
            remove_food: { type: Boolean, default: true }
        },
        orders: {
            list: { type: Boolean, default: true },
            update_status: { type: Boolean, default: true },
            place_order: { type: Boolean, default: false },
            user_orders: { type: Boolean, default: false },
            verify_order: { type: Boolean, default: false }
        },
        users: {
            add_user: { type: Boolean, default: true },
            edit_user: { type: Boolean, default: true },
            get_all_users: { type: Boolean, default: true },
            toggle_cart_lock: { type: Boolean, default: true },
            login: { type: Boolean, default: true }
        },
        restaurant: {
            edit_restaurant: { type: Boolean, default: true }
        }
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const restaurantModel = mongoose.model("Restaurant", restaurantSchema);

export default restaurantModel;
