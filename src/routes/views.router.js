const { Router } = require('express');

module.exports = (productManager, cartManager) => {
  const router = Router();

  router.get('/home', async (req, res) => {
    try {
      const { limit = 10, page = 1, sort, query } = req.query;
      
      let queryFilter = {};
      if (query) {
        if (query.includes('category:')) {
          queryFilter.category = query.split(':')[1];
        } else if (query.includes('status:')) {
          queryFilter.status = query.split(':')[1];
        }
      }

      const result = await productManager.getProducts({
        limit: parseInt(limit),
        page: parseInt(page),
        sort,
        query: queryFilter
      });

      res.render('home', {
        products: result.payload,
        pagination: result
      });
    } catch (error) {
      res.status(500).render('error', { error: 'Error interno del servidor' });
    }
  });

  router.get('/products/:pid', async (req, res) => {
    try {
      const productId = req.params.pid;
      const product = await productManager.getProductById(productId);

      if (product) {
        res.render('product', { product });
      } else {
        res.status(404).render('error', { error: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).render('error', { error: 'Error interno del servidor' });
    }
  });

  router.get('/carts/:cid', async (req, res) => {
    try {
      const cartId = req.params.cid;
      const cart = await cartManager.getCartById(cartId);

      if (cart) {
        res.render('cart', { cart });
      } else {
        res.status(404).render('error', { error: 'Carrito no encontrado' });
      }
    } catch (error) {
      res.status(500).render('error', { error: 'Error interno del servidor' });
    }
  });

  router.get('/realtimeproducts', async (req, res) => {
    try {
      const result = await productManager.getProducts({});
      res.render('realTimeProducts', { products: result.payload });
    } catch (error) {
      res.status(500).render('error', { error: 'Error interno del servidor' });
    }
  });

  return router;
};