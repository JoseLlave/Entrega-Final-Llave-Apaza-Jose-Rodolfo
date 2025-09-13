require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Product = require('../dao/models/product.model');

const existingProducts = [
  {
    title: "Producto Ejemplo 1",
    description: "Descripción del producto ejemplo 1",
    code: "P001",
    price: 100.99,
    status: true,
    stock: 50,
    category: "Electronicos",
    thumbnails: ["imagen1.jpg", "imagen2.jpg"]
  },
  {
    title: "Producto Ejemplo 2",
    description: "Descripción del producto ejemplo 2",
    code: "P002",
    price: 200.50,
    status: true,
    stock: 30,
    category: "Hogar",
    thumbnails: []
  },
  {
    title: "Producto Ejemplo 3",
    description: "Descripción del producto ejemplo 3",
    code: "P003",
    price: 150.75,
    status: true,
    stock: 20,
    category: "Ropa",
    thumbnails: ["imagen3.jpg"]
  }
];

const importProducts = async () => {
  try {
    await connectDB();
    
    await Product.deleteMany({});
    console.log('Colección de productos limpiada');
    
    const result = await Product.insertMany(existingProducts);
    console.log(`${result.length} productos importados exitosamente`);
    
    result.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} (${product.code})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error importando productos:', error);
    process.exit(1);
  }
};

importProducts();