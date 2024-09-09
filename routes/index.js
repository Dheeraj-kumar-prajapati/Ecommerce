const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser')
const { authMiddleware } = require('../controller/middleware');
const { getProducts } = require('../controller/getProducts');

router.use(cookieParser());

router.get('/', authMiddleware, async function (req, res) {

  const products = await getProducts(1);
  console.log("isAdmin : ", req.isAdmin);
  res.render("homePage", { products, isAdmin: req.isAdmin });

});

router.get('/login-user', (req, res) => {
  return res.render('login');
})

router.post('/getProducts', async (req, res) => {
  const { page } = req.body;
  const products = await getProducts(page);

  res.json(products);
  console.log("isAdmin : ", req.isAdmin);
})


router.get('/verify', (req, res) => {
  console.log("i am in verfiy");
  res.render('verify');
})

module.exports = router;
