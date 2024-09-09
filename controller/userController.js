const { User, Cart, Order } = require('../models/schema');

const updateUserInfo = async (req, res) => {
    const { name, email, address, phone } = req.body;

    if (!name || !email || !address || !phone) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.username = name;
        user.email = email;
        user.address = address;
        user.phoneNo = phone;

        await user.save();

        res.status(200).json({ message: "User information updated successfully" });
    } catch (error) {
        console.error('Error updating user information:', error);
        res.status(500).json({ error: 'Failed to update user information' });
    }
};

const placeOrder = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('cartId');
        const userCart = user.cartId;

        if (!checkProductQuantity(userCart)) {
            console.log("failed");
            return res.send("failed");
        }

        if (!userCart || userCart.products.length === 0) {
            return res.status(400).json({ error: 'Your cart is empty.' });
        }

        let userOrder = await Order.findOne({ userId: req.userId });

        userOrder.cartId.push(userCart._id);

        userCart.ordered = true;

        const newCart = await Cart.create({});
        user.cartId = newCart._id;
        await user.save();
        await userCart.save();
        await userOrder.save();

        res.json({ success: true, message: 'Order placed successfully!' });

    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Failed to place order. Please try again.' });
    }
};

const orderPage = async (req, res) => {
    const user = await User.findById(req.userId);
    const cart = await Cart.findById(user.cartId);

    const currentAddress = user.address;
    const subtotal = cart.totalAmount;
    const total = subtotal;

    if (subtotal < 1)
        return res.render('cart', { products: [] });
    else
        return res.render('orderPage', { currentAddress, subtotal, total });
};

const changeAddress = async (req, res) => {
    const { newAddress } = req.body;

    if (!newAddress) {
        return res.status(400).json({ error: "New address is required" });
    }

    try {
        const user = await User.findOneAndUpdate(
            { _id: req.userId },
            { $set: { address: newAddress } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ message: "Address changed successfully", user });
    } catch (error) {
        console.error('Error changing address:', error);
        return res.status(500).json({ error: "An error occurred while changing the address" });
    }
};

const orderHistory = async (req, res) => {
    const userProducts = await Order.findOne({ userId: req.userId });
    // Logic for fetching and displaying order history should be added here.
};

module.exports = {
    updateUserInfo,
    placeOrder,
    orderPage,
    changeAddress,
    orderHistory,
};
