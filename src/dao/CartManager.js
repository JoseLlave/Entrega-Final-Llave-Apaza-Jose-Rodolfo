const Cart = require('./models/cart.model');

class CartManager {
  async createCart() {
    try {
      const newCart = new Cart();
      await newCart.save();
      return newCart;
    } catch (error) {
      throw error;
    }
  }

  async getCartById(id) {
    try {
      const cart = await Cart.findById(id).populate('products.product');
      return cart;
    } catch (error) {
      throw error;
    }
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    try {
      const cart = await Cart.findById(cartId);

      if (!cart) {
        return { error: 'Carrito no encontrado' };
      }

      const existingProductIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (existingProductIndex !== -1) {
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        cart.products.push({
          product: productId,
          quantity: quantity
        });
      }

      await cart.save();
      return { success: true, cart };
    } catch (error) {
      throw error;
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
      const cart = await Cart.findById(cartId);

      if (!cart) {
        return { error: 'Carrito no encontrado' };
      }

      cart.products = cart.products.filter(
        item => item.product.toString() !== productId
      );

      await cart.save();
      return { success: true, cart };
    } catch (error) {
      throw error;
    }
  }

  async updateCartProducts(cartId, products) {
    try {
      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { products },
        { new: true, runValidators: true }
      ).populate('products.product');

      if (!cart) {
        return { error: 'Carrito no encontrado' };
      }

      return { success: true, cart };
    } catch (error) {
      throw error;
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      const cart = await Cart.findById(cartId);

      if (!cart) {
        return { error: 'Carrito no encontrado' };
      }

      const productItem = cart.products.find(
        item => item.product.toString() === productId
      );

      if (!productItem) {
        return { error: 'Producto no encontrado en el carrito' };
      }

      productItem.quantity = quantity;
      await cart.save();

      return { success: true, cart };
    } catch (error) {
      throw error;
    }
  }

  async clearCart(cartId) {
    try {
      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { products: [] },
        { new: true }
      );

      if (!cart) {
        return { error: 'Carrito no encontrado' };
      }

      return { success: true, cart };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CartManager;
