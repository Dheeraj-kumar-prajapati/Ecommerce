const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNo: { type: Number, default: 91 },
    address: { type: String },
    role: { type: String, required: true, default: 'user' },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
