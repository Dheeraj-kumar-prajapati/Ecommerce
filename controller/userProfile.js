const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { getUser } = require('./isUserValidate');


const privateKey = 'This is my private key';
router.use(express.json());

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.render('login', { isAdmin: false });
    }
    try {
        const decoded = jwt.verify(token, privateKey);
        req.userId = decoded.id;
        req.isAdmin = decoded.isAdmin;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

router.use(authMiddleware);

router.get('/profile', async (req, res) => {

    const userId = req.userId;
    const isAdmin = req.cookies.isAdmin;

    const user = await getUser(userId);

    console.log("user id : ", userId);
    res.render('profile', { user, isAdmin });
})

router.get('/admin-profile', async (req, res) => {

    const adminId = req.userId;
    const isAdmin = req.isAdmin;
    const admin = await getUser(adminId);

    if (admin) {
        if (isAdmin) {
            if (admin.role === 'admin')
                res.render('adminPanel', { admin });
            else
                return res.status(300).json({ error: "you are not authorized for these account" });
        }
    }
    else
        return res.status(400).json({ error: "admin not found" });
})

module.exports = router;