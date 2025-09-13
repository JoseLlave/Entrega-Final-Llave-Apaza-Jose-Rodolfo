const { Router } = require('express');

module.exports = (productManager) => {
  const router = Router();

  router.get('/', async (req, res) => {
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

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.get('/:pid', async (req, res) => {
    try {
      const productId = req.params.pid;
      const product = await productManager.getProductById(productId);

      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const productData = req.body;

      const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
      const missingFields = requiredFields.filter(field => !productData[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({ error: `Faltan campos requeridos: ${missingFields.join(', ')}` });
      }

      const newProduct = await productManager.addProduct(productData);

      if (req.io) {
        const products = await productManager.getProducts({});
        req.io.emit('updateProducts', products.payload);
      }

      res.status(201).json(newProduct);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: 'El código del producto ya existe' });
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.put('/:pid', async (req, res) => {
    try {
      const productId = req.params.pid;
      const updatedFields = req.body;
      
      if (updatedFields.id) {
        delete updatedFields.id;
      }

      const existingProduct = await productManager.getProductById(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const updatedProduct = await productManager.updateProduct(productId, updatedFields);

      if (req.io) {
        const products = await productManager.getProducts({});
        req.io.emit('updateProducts', products.payload);
      }

      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.delete('/:pid', async (req, res) => {
    try {
      const productId = req.params.pid;

      const existingProduct = await productManager.getProductById(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      await productManager.deleteProduct(productId);

      if (req.io) {
        const products = await productManager.getProducts({});
        req.io.emit('updateProducts', products.payload);
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
};