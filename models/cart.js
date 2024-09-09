const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductDetail', required: true },
            quantity: { type: Number, required: true, default: 1 },
            isRemoved: { type: Boolean, default: false }
        }
    ],
    totalAmount: { type: Number, default: 0 },
    ordered: { type: Boolean, default: false }
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
