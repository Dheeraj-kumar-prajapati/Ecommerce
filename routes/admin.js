const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Product, Cart, User } = require('../models/schema');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/image');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

function fileFilter(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Images Only!'));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});


const authMiddleware = (req, res, next) => {
    const privateKey = 'This is my private key';
    const token = req.cookies.token;
    if (!token) {
        return res.render('login', { isAdmin: false });
    }
    try {
        const decoded = jwt.verify(token, privateKey);
        req.adminId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

router.use(authMiddleware);
router.post('/add-product', upload.single('productImage'), async (req, res) => {
    try {
        const { productName, productDescription, price, quantity } = req.body;
        const productImage = `/image/${req.file.filename}`;
        console.log("image path : ", productImage);

        if (quantity <= 0) {
            return res.status(400).json({ error: "quantity not be negative or 0" })
        }

        if (price <= 0) {
            return res.status(400).json({ error: "price not be negative or 0" })
        }

        const product = new Product({
            productName: productName,
            description: productDescription,
            price: price,
            stock: quantity,
            image: productImage
        });
        await product.save();

        const adminId = req.adminId;
        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        const adminCartId = await Cart.findById(admin.cartId);

        if (!adminCartId) {
            return res.send("admin cart not found");
        }

        adminCartId.products.push({
            product: product._id,
            isRemoved: false
        });

        await adminCartId.save();

        res.status(201).json({ message: 'Product added successfully', product });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

router.get('/admin-products', async (req, res) => {
    try {
        const adminId = req.adminId;
        const admin = await User.findById(adminId).populate({
            path: 'cartId',
            populate: {
                path: 'products.product'
            }
        });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const adminCart = admin.cartId;
        if (!adminCart || !adminCart.products.length) {
            return res.status(204).json({ message: 'No products in admin cart', products: [] });
        }

        const products = adminCart.products
            .filter(product => product.product && !product.product.isRemoved)
            .map(product => product.product);

        res.json({ products });
    } catch (error) {
        console.error('Error fetching admin products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});


router.get('/show-product', async (req, res) => {
    try {
        const products = await Product.find({ isRemoved: false });

        res.render('adminProductPage', { products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});


router.delete('/delete-product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const deletedProduct = await Product.findByIdAndUpdate(
            productId,
            { isRemoved: true },
            { new: true }
        );


        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // const result = await Cart.updateMany(
        //     { 'products.product': productId },
        //     { $pull: { products: { product: productId } } }
        // );

        // const adminId = req.adminId;
        // await Admin.updateOne(
        //     { _id: adminId },
        //     { $pull: { products: { product: productId } } }
        // );

        res.status(200).json({ result: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

router.put('/update-product/:id', async (req, res) => {
    try {
        const { productName, productDescription, price, productQuantity } = req.body;
        const product = await Product.findByIdAndUpdate(req.params.id, {
            productName,
            description: productDescription,
            price,
            stock: productQuantity
        }, { new: true });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ product });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ error: 'Failed to fetch product details' });
    }
});




router.get('/add-product', (req, res) => {
    res.render('addProduct');
});

module.exports = router;
