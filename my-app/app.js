const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Employee = require('./models/Employee'); // Đảm bảo file này tồn tại

const app = express();
const PORT = 3000;

// Tạo thư mục lưu trữ nếu chưa tồn tại
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware và cấu hình
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));

// Kết nối MongoDB
mongoose
  .connect('mongodb+srv://nguyenquangtrung150704:trung.150704@cluster0.nfe6m.mongodb.net/mydatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Connection error:', err));

// Routes chính
app.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.render('index', { employees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/employees', upload.single('profileImage'), async (req, res) => {
  const { name, email, age, salary } = req.body;
  try {
    const newEmployee = new Employee({
      name,
      email,
      age: parseInt(age),
      salary: parseFloat(salary),
      profileImage: req.file ? `/uploads/${req.file.filename}` : null,
    });
    await newEmployee.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/employees/:id/edit', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    res.render('edit', { employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/employees/:id', upload.single('profileImage'), async (req, res) => {
  const { name, email, age, salary } = req.body;

  const updateData = {
    name,
    email,
    age: parseInt(age),
    salary: parseFloat(salary),
  };

  if (req.file) {
    updateData.profileImage = `/uploads/${req.file.filename}`;
  }

  try {
    await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/employees/:id/delete', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee.profileImage) {
      const filePath = path.join(__dirname, employee.profileImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await Employee.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
