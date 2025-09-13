const { Router } = require('express');

module.exports = (cartManager) => {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const newCart = await cartManager.createCart();
      res.status(201).json(newCart);
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.get('/:cid', async (req, res) => {
    try {
      const cartId = req.params.cid;
      const cart = await cartManager.getCartById(cartId);

      if (cart) {
        res.json(cart);
      } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.post('/:cid/product/:pid', async (req, res) => {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const quantity = req.body.quantity || 1;

      const result = await cartManager.addProductToCart(cartId, productId, quantity);

      result.error
        ? res.status(400).json(result)
        : res.status(201).json({ message: 'Producto agregado al carrito', cart: result.cart });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.delete('/:cid/products/:pid', async (req, res) => {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;

      const result = await cartManager.removeProductFromCart(cartId, productId);

      result.error
        ? res.status(400).json(result)
        : res.json({ message: 'Producto eliminado del carrito', cart: result.cart });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.put('/:cid', async (req, res) => {
    try {
      const cartId = req.params.cid;
      const { products } = req.body;

      if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'El campo products debe ser un array' });
      }

      const result = await cartManager.updateCartProducts(cartId, products);

      result.error
        ? res.status(400).json(result)
        : res.json({ message: 'Carrito actualizado', cart: result.cart });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.put('/:cid/products/:pid', async (req, res) => {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'La cantidad debe ser un número mayor a 0' });
      }

      const result = await cartManager.updateProductQuantity(cartId, productId, quantity);

      result.error
        ? res.status(400).json(result)
        : res.json({ message: 'Cantidad actualizada', cart: result.cart });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.delete('/:cid', async (req, res) => {
    try {
      const cartId = req.params.cid;

      const result = await cartManager.clearCart(cartId);

      result.error
        ? res.status(400).json(result)
        : res.json({ message: 'Carrito vaciado', cart: result.cart });
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
};