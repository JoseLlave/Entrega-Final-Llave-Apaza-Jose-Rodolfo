const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const cartSchema = new mongoose.Schema({
  products: {
    type: [cartItemSchema],
    default: []
  }
}, {
  timestamps: true
});

cartSchema.methods.calculateTotal = function() {
  return this.products.reduce((total, item) => {
    return total + (item.quantity * (item.product?.price || 0));
  }, 0);
};

module.exports = mongoose.model('Cart', cartSchema);