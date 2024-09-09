const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Ecommerce')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

const productSchema = new mongoose.Schema({
    image: { type: String, required: true },
    productName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: String },
    size: { type: String },
    stock: { type: Number },
    isRemoved: { type: Boolean, default: false }
});

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

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cartId: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }]
})

const Product = mongoose.model('ProductDetail', productSchema, 'ProductDetails');
const User = mongoose.model('User', userSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = {
    Product,
    User,
    Cart,
    Order
};
