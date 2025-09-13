require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Cart = require('../dao/models/cart.model');
const Product = require('../dao/models/product.model');

const importCarts = async () => {
  try {
    await connectDB();
    
    const products = await Product.find({});
    
    if (products.length === 0) {
      process.exit(1);
    }
    
    const productMap = {};
    products.forEach(product => {
      productMap[product.code] = product._id;
    });
    
    const cartsData = [
      {
        products: [
          {
            product: productMap['P001'],
            quantity: 2
          },
          {
            product: productMap['P002'],
            quantity: 1
          }
        ]
      },
      {
        products: [
          {
            product: productMap['P003'],
            quantity: 3
          }
        ]
      }
    ];
    
    await Cart.deleteMany({});
    
    const result = await Cart.insertMany(cartsData);
    
    for (let i = 0; i < result.length; i++) {
      const cart = await Cart.findById(result[i]._id).populate('products.product');
      cart.products.forEach(item => {
      });
    }
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

importCarts();