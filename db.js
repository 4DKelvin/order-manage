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
        warn: {
            type: Boolean
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
            type: String
        },
        dep_city: {
            type: String
        },
        dep_time: {
            type: String
        },
        arr_city: {
            type: String
        },
        arr_time: {
            type: String
        }
    }))
};