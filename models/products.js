const mongoose = require('mongoose');

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

const Product = mongoose.model('ProductDetail', productSchema, 'ProductDetails');
module.exports = Product;
