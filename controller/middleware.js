const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const privateKey = 'This is my private key';
    const token = req.cookies.token;
    if (!token) {
        req.isAdmin = false;
        return next();
    }
    try {
        const decoded = jwt.verify(token, privateKey);
        req.userId = decoded.id;
        req.isAdmin = decoded.isAdmin;
        console.log("mid isadmin : ", req.isAdmin);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { authMiddleware }