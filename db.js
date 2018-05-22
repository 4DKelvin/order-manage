const mongoose = require('mongoose');
const schema = new mongoose.Schema({});
mongoose.connect('mongodb://localhost/orders');

module.exports = {
    Order: mongoose.model('Order', schema),
    User: mongoose.model('User', schema),
    Setting: mongoose.model('Setting', new mongoose.Schema({
        name: {
            type: String
        },
        value: {
            type: String
        }
    })),
    Space: mongoose.model('Space', new mongoose.Schema({
        id: {
            type: String
        },
        updated_at: {
            type: Number
        },
        flight_date: {
            type: String
        },
        flight_no: {
            type: String
        },
        space_name: {
            type: String
        },
        space_count: {
            type: Number
        },
        dep_city: {
            type: String
        },
        dep_time: {
            type: Number
        },
        arr_city: {
            type: String
        },
        arr_time: {
            type: Number
        }
    }))
};