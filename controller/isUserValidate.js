const { User, Cart, Product, Order } = require('../models/schema');
const bcrypt = require('bcryptjs');


const addUser = async (email, username, password) => {
    try {
        const cart = await Cart.create({});
        const order = await Order.create({});

        const cartId = cart._id;
        const orderId = order._id;

        const user = await User.create({
            username,
            email,
            password,
            cartId,
            orderId
        });

        order.userId = user._id;
        await order.save();

        return user;
    } catch (error) {
        console.error("Error in addUser function:", error);
        if (error.code === 11000) {
            throw new Error('Username or email already exists');
        }
        throw error;
    }
};


const addProductToCart = async (cartId, productId) => {
    try {
        const userCart = await Cart.findOne({ _id: cartId });
        console.log("user cart : ", userCart);

        if (!userCart) {
            throw new Error('Cart not found');
        }

        const product = await Product.findOne({ _id: productId });

        if (!product) {
            throw new Error('Product not found');
        }

        console.log("prodcut :", product);

        const existingProduct = userCart.products.find(p => p.product._id.toString() === productId)

        console.log("exist : ", existingProduct);
        console.log("stock  : ", product.stock);

        if (existingProduct) {
            if (existingProduct.quantity < product.stock) {
                if (existingProduct.isRemoved) {
                    existingProduct.isRemoved = false;
                    existingProduct.quantity = 1;
                }
                else
                    existingProduct.quantity += 1;
            }
            else
                return false;

        } else if (product.stock > 0) {
            userCart.products.push({ product: product });
        }
        else
            return false

        userCart.totalAmount += product.price;

        await userCart.save();

        console.log("Product added to cart successfully");
        return true;

    } catch (error) {
        console.error("Error in adding product to cart", error);
        throw error;
    }
}

// const removeFromCart = async (cartId, productId) => {
// try {
// const userCart = await Cart.findOne({ _id: cartId });
// 
// if (!userCart) {
// throw new Error('Cart not found');
// }
// 
// const product = await Product.findOne({ _id: productId });
// 
// if (!product) {
// throw new Error('Product not found');
// }
// 
// const existingProduct = userCart.products.find(p => p.product._id.toString() === productId);
// 
// if (existingProduct) {
// existingProduct.quantity += 1;
// } else {
// userCart.products.push({ product: product, quantity: 1 });
// }
// 
// await userCart.save();
// 
// console.log("Product added to cart successfully");
// return true;
// 
// } catch (error) {
// console.error("Error in adding product to cart", error);
// throw error;
// }
// }

const getUserProducts = async (cartId) => {
    try {
        const cart = await Cart.findOne({ _id: cartId }).populate('products.product');

        if (!cart) {
            return { status: 404, message: "Cart not found", products: [] };
        }

        const availableProducts = cart.products.filter(product => !product.isRemoved);

        console.log("User products:", availableProducts);

        return availableProducts;

    } catch (error) {
        console.error("Error in getUserProducts:", error);
        return { status: 500, message: "Internal server error", products: [] };
    }
};


const checkUser = async (email) => {
    try {
        const user = await User.findOne({ email });
        return !!user;
    } catch (error) {
        console.error("Error in checkUser function:", error);
        throw error;
    }
};

const findUser = async (email, password, isAdmin) => {
    try {
        const user = await User.findOne({ email });
        console.log("user :", user);

        if (user && await bcrypt.compare(password, user.password)) {
            if (user.role === 'admin' || user.role === 'user')
                return user;
            else
                return false;
        }

        return null;

    } catch (error) {
        console.error("Error in findUser function:", error);
        throw error;
    }
};

const findAdmin = async (email, password, isAdmin) => {
    try {
        const admin = await Admin.findOne({ email });

        if (admin && await bcrypt.compare(password, admin.password)) {
            if (isAdmin) {
                if (admin.role === 'admin')
                    return admin;
                else
                    return false;
            }
            else
                return false;
        }

        return null;

    } catch (error) {
        console.error("Error in findAdmin function:", error);
        throw error;
    }
};

const getAdmin = async (adminId) => {
    try {
        const admin = await Admin.findOne({ _id: adminId });

        if (admin) {
            return admin;
        }

        return null;

    } catch (error) {
        console.error("Error in findUser function:", error);
        throw error;
    }
}

const getUser = async (userId) => {
    try {
        const user = await User.findOne({ _id: userId });
        console.log("find user : ", user);

        if (user) {
            return user;
        }

        return null;

    } catch (error) {
        console.error("Error in findUser function:", error);
        throw error;
    }
}

const resetPassword = async (email, newPassword) => {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log("new password from rest : ", newPassword);

        const user = await User.findOneAndUpdate(
            { email },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        console.log("Found user:", user);

        if (!user) {
            console.log("User not found");
            return null;
        }

        console.log("Password updated successfully for user:", user.email);
        return true;

    } catch (error) {
        console.error("Error in resetPassword function:", error);
        throw error;
    }
}

const checkProductQuantity = async (userCart) => {
    const cart = await Cart.findById(userCart).populate('products.product');

    for (let item of cart.products) {
        if (item.quantity > item.product.stock) {
            return false;
        } else {
            item.product.stock -= item.quantity;
            await item.product.save();
        }
    }

    return true;
};


module.exports = {
    addUser,
    checkUser,
    findUser,
    getUser,
    getAdmin,
    resetPassword,
    addProductToCart,
    getUserProducts,
    findAdmin,
    checkProductQuantity
};
