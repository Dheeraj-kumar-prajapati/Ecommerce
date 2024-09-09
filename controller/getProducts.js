const { Product } = require('../models/schema');

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


module.exports = { getProducts };