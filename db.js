const mongoose = require('mongoose');
const schema = new mongoose.Schema({});
mongoose.connect('mongodb://localhost/orders');

module.exports = {
    Order: mongoose.model('Order', schema),
    User: mongoose.model('User', schema)
};