const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { getUser, addProductToCart, getUserProducts } = require('../controller/isUserValidate');
const { removeProductFromCart, increaseQuantity, decreaseQuantity, reset } = require('../controller/cartOperation');
const { addCartAuth, cartAuth } = require('../controller/middleware');

router.use(express.json());

router.post('/add-to-cart', addCartAuth, async (req, res) => {
    const userId = req.userId;
    const { productId } = req.body;

    try {
        console.log("Product ID:", productId);

        const user = await getUser(userId);
        console.log("user : ", user);

        if (!user || !user.cartId) {
            return res.status(404).json({ message: "User or cart not found" });
        }

        console.log("Cart ID:", user.cartId);

        if (await addProductToCart(user.cartId, productId)) {
            return res.status(200).json({ message: "Product added to cart" });
        } else {
            return res.status(300).json({ message: "Product limit reached" });
        }
    } catch (error) {
        console.error("Error in add-to-cart route:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/showCart', cartAuth, async (req, res) => {
    const userId = req.userId;
    const isAdmin = req.isAdmin;

    if (isAdmin) {
        return res.render('homePage', { isAdmin });
    }
    console.log("i am in cart");

    const user = await getUser(userId);

    if (!user) {
        return res.send("User not found in showCart");
    }

    const cartId = user.cartId;

    const userProducts = await getUserProducts(cartId);

    console.log("user product : ", userProducts);
    res.render('cart', { products: userProducts, isAdmin });

})

router.post('/remove-from-cart', cartAuth, async (req, res) => {
    const { productId } = req.body;
    const userId = req.userId;

    console.log("i am in remove");

    const user = await getUser(userId);

    if (!user) {
        return res.status(404).json({ error: "User not found from the remove cart" });
    }

    const cartId = user.cartId;
    console.log("cart id :", cartId);

    if (await removeProductFromCart(cartId, productId)) {
        return res.status(200).json({ data: "product removed" });
    }
    else {
        return res.status(400).json({ error: "error in removeProduct route" });
    }
})

router.post('/increase-product', cartAuth, async (req, res) => {
    const { productId, value } = req.body;
    const userId = req.userId;

    const user = await getUser(userId);

    if (!user) {
        return res.status(404).json({ error: "User not found from the remove cart" });
    }

    const cartId = user.cartId;
    console.log("cart id :", cartId);

    if (await increaseQuantity(cartId, productId, value)) {
        return res.status(200).json({ data: "increase quantity" });
    }
    else {
        return res.status(400).json({ error: "product stock limit reached" });
    }
})

router.post('/decrease-product', cartAuth, async (req, res) => {
    const { productId } = req.body;
    const userId = req.userId;

    const user = await getUser(userId);

    if (!user) {
        return res.status(404).json({ error: "User not found from the remove cart" });
    }

    const cartId = user.cartId;
    console.log("cart id :", cartId);

    if (await decreaseQuantity(cartId, productId)) {
        return res.status(200).json({ data: "increase quantity" });
    }
    else {
        return res.status(400).json({ error: "error in increase quantity route" });
    }
})

router.post('/reset-quantity', cartAuth, async (req, res) => {
    const { productId } = req.body;
    const userId = req.userId;

    const user = await getUser(userId);

    if (!user) {
        return res.status(404).json({ error: "User not found from the remove cart" });
    }

    const cartId = user.cartId;
    console.log("cart id :", cartId);

    if (await reset(cartId, productId)) {
        return res.status(200).json({ data: "increase quantity" });
    }
    else {
        return res.status(400).json({ error: "error in increase quantity route" });
    }
})


module.exports = router;