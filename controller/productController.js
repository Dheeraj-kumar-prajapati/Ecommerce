const Product = require('../models/Product');

const getProducts = async (count) => {
    try {
        const pageNo = Math.floor(count);
        const page = parseInt(pageNo, 10) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const products = await Product.find({ isRemoved: false })
            .skip(skip)
            .limit(limit)
            .exec();

        return products;
    } catch (err) {
        console.error('Error fetching products:', err);
        throw new Error('Server error');
    }
};

const renderHomePage = async (req, res) => {
    const products = await getProducts(1);
    console.log("isAdmin : ", req.isAdmin);
    res.render("homePage", { products, isAdmin: req.isAdmin });
};

const renderLoginPage = (req, res) => {
    res.render('login');
};

const renderVerifyPage = (req, res) => {
    console.log("I am in verify");
    res.render('verify');
};

const getProductsByPage = async (req, res) => {
    const { page } = req.body;
    const products = await getProducts(page);
    res.json(products);
    console.log("isAdmin : ", req.isAdmin);
};

module.exports = {
    renderHomePage,
    renderLoginPage,
    renderVerifyPage,
    getProductsByPage,
};
