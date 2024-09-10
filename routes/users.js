const express = require('express');
const router = express.Router();
const { User, Cart, Order, Product } = require('../models/schema');
const { authMiddleware } = require('../controller/middleware'); // change these middleware
const { checkProductQuantity } = require('../controller/isUserValidate');

router.post('/update-user-info', authMiddleware, async (req, res) => {
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
});

router.get('/place-order', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cartId');
    const userCart = user.cartId;

    if (!checkProductQuantity(userCart)) {
      console.log("failed");
      return res.send("falied");
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
});



router.get('/order-page', authMiddleware, async (req, res) => {

  const user = await User.findById({ _id: req.userId });

  const cart = await Cart.findById({ _id: user.cartId });

  const currentAddress = user.address;
  const subtotal = cart.totalAmount;
  const total = subtotal;

  if (subtotal < 1)
    return res.render('cart', { products: [] })
  else
    return res.render('orderPage', { currentAddress, subtotal, total });
})


router.post('/change-address', authMiddleware, async (req, res) => {
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
});

router.get('/order-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).send('User ID is required');
    }

    const orders = await Order.find({ userId: userId }).exec();

    if (!orders.length) {
      return res.status(404).send('No orders found for this user');
    }

    const cartIds = orders.flatMap(order => order.cartId);
    const carts = await Cart.find({ _id: { $in: cartIds } }).exec();

    const productIds = carts.flatMap(cart =>
      cart.products.map(product => product.product)
    );
    const products = await Product.find({ _id: { $in: productIds } }).exec();

    const productMap = new Map(products.map(product => [product._id.toString(), product]));

    const orderHistory = orders.map(order => {
      return {
        ...order.toObject(),
        carts: carts.filter(cart => order.cartId.includes(cart._id.toString()))
          .map(cart => ({
            ...cart.toObject(),
            products: cart.products.map(product => ({
              ...product.toObject(),
              productDetails: productMap.get(product.product.toString())
            }))
          }))
      };
    });

    res.render('orderHistory', { orders: orderHistory });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).send('Error fetching order history');
  }
});


module.exports = router;
