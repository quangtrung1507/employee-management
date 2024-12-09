const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const multer = require('multer');
const path = require('path');

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Thư mục lưu file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Tên file duy nhất
  },
});
const upload = multer({ storage: storage });

// Trang chủ: hiển thị danh sách hóa đơn
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.render('index', { invoices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm hóa đơn mới
router.post('/invoices', upload.single('productImage'), async (req, res) => {
  const { customerName, item, quantity, price } = req.body;

  if (!customerName || !item || !quantity || !price) {
    return res.status(400).json({ error: 'Tất cả các trường đều bắt buộc.' });
  }

  const quantityNum = parseInt(quantity);
  const priceNum = parseFloat(price);

  if (isNaN(quantityNum) || isNaN(priceNum)) {
    return res.status(400).json({ error: 'Quantity và Price phải là số hợp lệ.' });
  }

  try {
    const newInvoice = new Invoice({
      customerName,
      item,
      quantity: quantityNum,
      price: priceNum,
      productImage: req.file ? `/uploads/${req.file.filename}` : null, // Lưu đường dẫn ảnh
    });

    await newInvoice.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sửa hóa đơn
router.get('/invoices/:id/edit', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    res.render('edit', { invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/invoices/:id', upload.single('productImage'), async (req, res) => {
  const { customerName, item, quantity, price } = req.body;

  const updateData = {
    customerName,
    item,
    quantity: parseInt(quantity),
    price: parseFloat(price),
  };

  if (req.file) {
    updateData.productImage = `/uploads/${req.file.filename}`; // Cập nhật ảnh nếu có
  }

  try {
    await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa hóa đơn
router.get('/invoices/:id/delete', async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
