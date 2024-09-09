const { User, Cart, Product } = require('../models/schema');

const removeProductFromCart = async (cartId, productId) => {
    try {
        const userCart = await Cart.findOne({ _id: cartId }).populate('products.product');

        if (!userCart) {
            console.log("UserCart is not found in removeProduct");
            return null;
        }

        const userProduct = userCart.products.find(p => p.product._id.toString() === productId);
        console.log("User product: ", userProduct);
        if (!userProduct) {
            return null;
        }

        userProduct.isRemoved = true;

        userCart.totalAmount -= userProduct.quantity * userProduct.product.price;

        await userCart.save();
        console.log("Product removed");

        return true;
    } catch (error) {
        console.error("Error removing product from cart:", error);
        return null;
    }
}

const increaseQuantity = async (cartId, productId, value) => {
    const userCart = await Cart.findOne({ _id: cartId });

    if (!userCart) {
        console.log("UserCart is not found in increaseQuantity");
        return null;
    }

    const userProduct = userCart.products.find(p => p.product._id.toString() === productId);

    if (!userProduct) {
        console.log("Product not found in user's cart");
        return null;
    }

    const product = await Product.findById(productId);

    if (!product) {
        console.log("Product not found in the database");
        return null;
    }

    if (value >= product.stock) {
        console.log("Cannot increase quantity beyond available stock");
        return false;
    }

    userProduct.quantity += 1;
    userCart.totalAmount += product.price;
    await userCart.save();
    return true;
}


const decreaseQuantity = async (cartId, productId) => {

    const userCart = await Cart.findOne({ _id: cartId });

    if (!userCart) {
        console.log("UserCart is not found in increaseQuantity");
        return null;
    }

    const userProduct = userCart.products.find(p => p.product._id.toString() === productId);

    if (!userProduct) {
        return null;
    }

    const product = await Product.findById(productId);

    if (!product) {
        console.log("Product not found in the database");
        return null;
    }

    if (userProduct.quantity !== 1)
        userProduct.quantity -= 1;

    userCart.totalAmount -= product.price;
    await userCart.save();
    return true;
}

const reset = async (cartId, productId) => {

    const userCart = await Cart.findOne({ _id: cartId });

    if (!userCart) {
        console.log("UserCart is not found in increaseQuantity");
        return null;
    }

    const userProduct = userCart.products.find(p => p.product._id.toString() === productId);

    if (!userProduct) {
        return null;
    }

    userProduct.quantity = 1;

    await userCart.save();
    removeProductFromCart(cartId, productId);
    return true;
}

module.exports = { removeProductFromCart, increaseQuantity, decreaseQuantity, reset };