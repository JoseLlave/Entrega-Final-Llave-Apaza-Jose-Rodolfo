require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const { Server } = require('socket.io');
const http = require('http');

const connectDB = require('./config/database');
const ProductManager = require('./dao/ProductManager');
const CartManager = require('./dao/CartManager');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;

// Conectar a la base de datos
connectDB();

// Crear instancias de los managers
const productManager = new ProductManager();
const cartManager = new CartManager();

// Configurar Handlebars
app.engine('handlebars', engine({
  helpers: {
    multiply: (a, b) => a * b
  }
}));
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Compartir io con las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas - Pasa las instancias de los managers
app.use('/api/products', productsRouter(productManager));
app.use('/api/carts', cartsRouter(cartManager));
app.use('/', viewsRouter(productManager, cartManager));

// WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('newProduct', async (productData) => {
    try {
      console.log('Recibiendo nuevo producto:', productData);
      
      const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
      const missingFields = requiredFields.filter(field => !productData[field]);

      if (missingFields.length > 0) {
        socket.emit('error', `Faltan campos requeridos: ${missingFields.join(', ')}`);
        return;
      }

      const newProduct = await productManager.addProduct(productData);
      console.log('Producto creado:', newProduct);
      
      const result = await productManager.getProducts({});
      io.emit('updateProducts', result.payload);
      
    } catch (error) {
      if (error.code === 11000) {
        socket.emit('error', 'El código del producto ya existe');
      } else {
        socket.emit('error', 'Error interno del servidor');
      }
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      
      const result = await productManager.deleteProduct(productId);
      
      if (!result) {
        socket.emit('error', 'Producto no encontrado');
        return;
      }

      const products = await productManager.getProducts({});
      io.emit('updateProducts', products.payload);
      
    } catch (error) {
      socket.emit('error', 'Error interno del servidor');
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.redirect('/home');
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: 'Error interno del servidor' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).render('error', { error: 'Página no encontrada' });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor online en http://localhost:${PORT}`);
});