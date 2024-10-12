const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  price: {
    type: Number,
    required: true,
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
