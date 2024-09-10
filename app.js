const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const addToCart = require('./routes/cart');
const operations = require('./controller/opertion');
const userProfile = require('./controller/userProfile');
const admin = require('./routes/admin');
const { authMiddleware } = require('./controller/middleware');


const app = express();
const PORT = 3000

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/addTo', addToCart);
app.use('/users', usersRouter);

app.use('/operation', operations);
app.use('/userProfile', userProfile);
app.use('/admin', admin);

app.get('/login', (req, res) => {
  return res.render('login', { isAdmin: req.isAdmin });
})

app.get('/signUp', authMiddleware, (req, res) => {
  return res.render('signUp', { isAdmin: req.isAdmin });
})

app.get('/forgot', (req, res) => {
  return res.render('forgot');
})

app.get('/cart', (req, res) => {
  return res.render('cart');
})

app.get('/adminPanel', (req, res) => {
  res.redirect('/userProfile/admin-profile');
})

app.get('/orderPage', (req, res) => {
  res.render('orderPage');
})


app.listen(PORT, () => {
  console.log(`Server runing on port : ${PORT}`);
})

module.exports = app;
