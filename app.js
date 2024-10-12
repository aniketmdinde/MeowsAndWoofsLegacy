// data
const express = require('express')
const app = express()
const path = require('path')
const connectDB = require('./db/connect');
require('dotenv').config()
const Product = require("./models/product")
const Order = require("./models/order")
const User = require("./models/user")
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const user = require('./models/user');
const port = 5000
const ProductC = ['food','leash','toys']
const AnimalC = ['dog','cat']

//middleware
app.use(express.static(path.join(__dirname,"public")))
app.use(express.urlencoded( {extended : true} ))
app.use(express.json())
app.set('view engine','ejs')
app.use(session({
    secret : 'notagoodsec',
    resave : false,
    saveUninitialized : true
}))
app.use(cookieParser());

// Landing Page
app.get('/', (req,res) => {
    res.render('INDEX')
})

//User related requests
app.get('/signup', (req,res) => {
    res.render('signup')
})

app.get('/login', (req,res) => {
    res.render('login')
})

app.post('/login', async (req,res) => {
    const {username, email, password} = req.body
    const hash = await bcrypt.hash(password,12)
    const user = await new User({username, email, password : hash})
    await user.save()
    res.redirect('/login')
})

app.post('/logout', (req,res) => {
    req.session.destroy()
    res.redirect('/')
})

//Shop related request
app.get('/shop' , async (req,res)=>{
    let username = req.session.user_id
    const {AnimalCategory : ac, ProductCategory : pc} = req.query;
    console.log(ac,pc)
    console.log(req.query)
    if((ac === undefined && pc === undefined) || (ac === "" && pc === ""))
    {
        let products = await Product.find({})
        res.render('shoppage',{products,ProductC,AnimalC,ac,pc,username})
    }
    else if(ac === "")
    {
        products = await Product.find({ProductCategory : pc})
        res.render('shoppage',{products,ProductC,AnimalC,ac,pc,username})
    }
    else if(pc === "")
    {
        products = await Product.find({AnimalCategory : ac})
        res.render('shoppage',{products,ProductC,AnimalC,ac,pc,username})
    }
    else
    {
        products = await Product.find({AnimalCategory : ac,ProductCategory : pc})
        res.render('shoppage',{products,ProductC,AnimalC,ac,pc,username})
    }
})


app.post('/shop', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({username})
    const validPassword = await bcrypt.compare(password, user.password)
    if(validPassword)
    {
        req.session.user_id = user._id
        req.session.user_id = user.username
        let products = await Product.find({})
        let ac,pc;
        res.render("shoppage",{products,ProductC,AnimalC,ac,pc,username})
    }
    else
    {
        res.redirect('/shop')
    }
});

app.get('/shop/:id', async (req, res) => {
    const { id } = req.params;
    res.cookie('product_id', id);
    let username = req.session.user_id;
    console.log(id);
    const product = await Product.findOne({ _id: id });
    console.log(product);
    res.render('shopping', { product, username });
});

//Payment related requests
app.post('/payment', async (req, res) => {
    try {
      const productId = req.cookies.product_id;
      const userId = req.session.user_id;
  
      if (!userId) {
        return res.status(400).send('User not authenticated.');
      }
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).send('Product not found.');
      }
  
      const { price } = product;

      const order = new Order({
        product: productId,
        user: userId,
        price: price,
      });
      console.log(order);
  
      await order.save();
  
      res.clearCookie('product_id');
  
      res.redirect('/shop');
    } 
    catch (err) {
      console.error(err);
      res.status(500).send('Error creating the order.');
    }
});
  
app.get('/payment/:id', (req,res) => {
    res.render('PAYMENT')
})

//Other
app.get('/new', (req,res) => {
    res.render('new')
})

app.post('/shop/new/admin', async (req,res) => {
    const newProduct = new Product(req.body)
    await newProduct.save()
    console.log(newProduct)
    res.send(`Added\n${newProduct}`)
})

//Server
const start = async () => {
    try
    {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server listening to port ${port}`);
        })
    }
    catch(err)
    {
        console.log(err)
    }
}
start()