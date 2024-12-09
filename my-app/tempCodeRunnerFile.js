const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Để kiểm tra và tạo thư mục
const Invoice = require('./models/Invoice');

const app = express();
const PORT = 3000;

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
//
//const path = require('path');

// Middleware phục vụ file tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình EJS làm công cụ template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

// Cấu hình Multer để lưu ảnh vào thư mục "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Thư mục lưu file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Tên file duy nhất
  },
});
const upload = multer({ storage });

// Để phục vụ file tĩnh từ thư mục "uploads"
app.use('/uploads', express.static(uploadDir));

// Kết nối MongoDB
const uri =
  'mongodb+srv://nguyenquangtrung150704:trung.150704@cluster0.nfe6m.mongodb.net/mydatabase?retryWrites=true&w=majority';
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Kết nối thành công tới MongoDB Atlas'))
  .catch((err) => console.log('Lỗi kết nối:', err));

// Route mặc định cho trang chủ
app.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.render('index', { invoices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm hóa đơn mới (với upload file)
app.post('/invoices', upload.single('productImage'), async (req, res) => {
  const { customerName, item, quantity, price } = req.body;

  if (!customerName || !item || !quantity || !price) {
    return res.status(400).json({ error: 'Tất cả các trường đều bắt buộc.' });
  }

  try {
    const newInvoice = new Invoice({
      customerName,
      item,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      productImage: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newInvoice.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sửa hóa đơn (hiển thị giao diện chỉnh sửa)
app.get('/invoices/:id/edit', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    res.render('edit', { invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật hóa đơn
app.post('/invoices/:id', upload.single('productImage'), async (req, res) => {
  const { customerName, item, quantity, price } = req.body;

  const updateData = {
    customerName,
    item,
    quantity: parseInt(quantity),
    price: parseFloat(price),
  };

  if (req.file) {
    updateData.productImage = `/uploads/${req.file.filename}`;
  }

  try {
    await Invoice.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa hóa đơn
app.get('/invoices/:id/delete', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (invoice.productImage) {
      const filePath = path.join(__dirname, invoice.productImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Xóa file nếu tồn tại
      }
    }
    await Invoice.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
