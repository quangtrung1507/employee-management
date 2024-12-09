// models/Invoice.js
const mongoose = require('mongoose');

// Định nghĩa Schema cho Invoice
// models/Invoice.js
const invoiceSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  productImage: { type: String } // Lưu đường dẫn ảnh
});


const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;