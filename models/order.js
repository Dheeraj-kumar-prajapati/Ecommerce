const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cartId: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }]
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
