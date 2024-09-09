const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { sendOTP } = require('./sendOTP');
const { checkUser, addUser, findUser, resetPassword, findAdmin } = require('./isUserValidate');


const privateKey = 'This is my private key';


router.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


router.post('/login', async (req, res) => {
    console.log("Attempting login");
    try {
        const { email, password, isAdmin } = req.body;

        if (!email || !password) {
            return res.status(400).send('All fields are required');
        }

        const user = await findUser(email, password, isAdmin);

        if (!user) {
            if (isAdmin)
                return res.status(400).json({ error: "You are not authorized for these account" });

            else
                return res.status(400).json({ error: "Invalid username or password" });
        }

        const token = jwt.sign({ id: user._id, isAdmin: isAdmin }, privateKey, { expiresIn: '3d' });

        const options = {
            maxAge: 3 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true
        };

        res.cookie('token', token, options);

        if (isAdmin) {
            console.log("i am in admin login");
            return res.status(200).json({ message: "Login successful as admin", redirectUrl: '/adminPanel' });
        }
        else
            return res.status(200).json({ message: "Login successful as user ", redirectUrl: '/' });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { email, name, password } = req.body;

        console.log("Processing signup for:", email);

        if (!(email && name && password)) {
            return res.status(400).send('All fields are required');
        }

        if (await checkUser(email)) {
            return res.status(400).json({ message: 'This email is already registered' });
        }

        const OTP = await sendOTP(email);

        req.session.otp = OTP.toString();
        req.session.email = email;
        req.session.username = name;
        req.session.password = password;
        req.session.flag = 1;

        return res.redirect('/verify');
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/resend-otp', async (req, res) => {
    if (!req.session.email) {
        return res.status(400).json({ error: 'Email not found in session' });
    }

    try {
        const newOTP = await sendOTP(req.session.email);
        req.session.otp = newOTP.toString();

        return res.render('verify');
    } catch (error) {
        console.error("Error resending OTP:", error);
        return res.status(500).json({ error: 'Error resending OTP. Please try again.' });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { otp } = req.body;
        console.log("otp : ", otp);
        console.log("session otp : ", req.session.otp);

        if (otp !== req.session.otp) {
            if (req.session.flag) {
                return res.status(400).json({
                    error: 'Invalid OTP. Please try again.',
                    redirectTo: '/operation/verify'
                });
            }
        }


        if (req.session.flag) {
            const email = req.session.email;
            const username = req.session.username;
            const password = req.session.password;

            const myEncPassword = await bcrypt.hash(password, 10);
            const user = await addUser(email, username, myEncPassword);
            const token = jwt.sign({ id: user._id }, privateKey, { expiresIn: '3d' });

            req.session.destroy();
            return res.redirect('/login');
        }
        else {
            res.render('resetForm');
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/logout', (req, res) => {
    console.log("i am in logout");
    res.clearCookie('token');
    res.clearCookie('isAdmin');
    return res.redirect('/login');
})

router.get('/admin-logout', (req, res) => {
    res.clearCookie('token');
    res.clearCookie('isAdmin');
    return res.redirect('/login');
})

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (await checkUser(email)) {
        const OTP = await sendOTP(email);

        req.session.otp = OTP.toString();
        req.session.email = email;
        req.session.flag = 0;

        console.log("session from forgot : ", req.session);
        // res.render('verify');
        res.status(200).json({ message: "user verified" });
    }
    else {
        res.status(200).json({ error: "Email is not registered" });
    }
})

router.post('/reset-password', async (req, res) => {

    const { newPassword } = req.body;
    console.log("body :", req.body);

    const email = req.session.email;

    console.log("session from rest : ", req.session);
    console.log("new password from rest : ", newPassword);

    console.log("email from rest  : ", email);
    const user = await checkUser(email)
    console.log("user from rest  :", user);

    if (user) {

        if (await resetPassword(email, newPassword)) {
            console.log("i am in destory");
            req.session.destroy();
            return res.status(201).json({ data: "rest password done" });
        }
        else {
            return res.status(200).json({ message: "Some thing wrong" });
        }
    }
    else {
        return res.status(404).json({ message: "User not found" });
    }
})

module.exports = router;
